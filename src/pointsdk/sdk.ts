import {
    ZProxyWS,
    PointType,
    PromisedValue,
    URLSearchQuery,
    ZProxyWSOptions,
    StorageGetRequest,
    StoragePutStringRequest,
    OwnerToIdentityRequest,
    SubscriptionErrors,
    MessageQueueConfig,
    ContractLoadRequest,
    ContractCallRequest,
    ContractSendRequest,
    SubscriptionMessages,
    SubscriptionEvent,
    SubscriptionParams,
    EncryptDataRequest,
    DecryptDataRequest,
    PublicKeyByIdentityRequest,
    IdentityToOwnerRequest,
} from "./index.d";

const getSdk = (host: string, version: string): PointType => {
    class PointSDKRequestError extends Error {}
    class MessageQueueOverflow extends Error {}
    class ZProxyWSConnectionError extends Error {}
    class ZProxyWSConnectionClosed extends Error {}
    class SubscriptionRequestTimeout extends Error {}
    class SubscriptionError extends Error {}

    // const getAuthHeaders = () => ({ Authorization: 'Basic ' + btoa('WALLETID-PASSCODE') });
    const getAuthHeaders = (): HeadersInit => ({
        "wallet-token": "WALLETID-PASSCODE",
    });

    const apiCall = async <T>(path: string, config?: RequestInit) => {
        try {
            // @ts-ignore, https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#xhr_and_fetch
            const response = await window.top.fetch(`${host}/v1/api/${path}`, {
                cache: "no-cache",
                credentials: "include",
                keepalive: true,
                ...config,
                headers: {
                    "Content-Type": "application/json",
                    ...config?.headers,
                },
            });

            if (!response.ok) {
                const { ok, status, statusText, headers } = response;
                console.error("SDK call failed:", {
                    // @ts-ignore
                    ok,
                    status,
                    statusText,
                    headers: Object.fromEntries([...headers.entries()]),
                });
                throw new PointSDKRequestError("Point SDK request failed");
            }

            try {
                return (await response.json()) as T;
            } catch (e) {
                console.error("Point API response parsing error:", e);
                throw e;
            }
        } catch (e) {
            console.error("Point API call failed:", e);
            throw e;
        }
    };

    const zproxyStorageCall = async <T>(path: string, config?: RequestInit) => {
        try {
            // @ts-ignore, https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#xhr_and_fetch
            const response = await window.top.fetch(`${host}/${path}`, {
                cache: "no-cache",
                credentials: "include",
                keepalive: true,
                ...config,
                //
            });

            if (!response.ok) {
                const { ok, status, statusText, headers } = response;
                console.error("SDK ZProxy call failed:", {
                    // @ts-ignore
                    ok,
                    status,
                    statusText,
                    headers: Object.fromEntries([...headers.entries()]),
                });
                throw new PointSDKRequestError("Point SDK request failed");
            }

            try {
                return (await response.json()) as T;
            } catch (e) {
                console.error("Point API response parsing error:", e);
                throw e;
            }
        } catch (e) {
            console.error("Point API call failed:", e);
            throw e;
        }
    };

    const api = {
        get<T>(
            pathname: string,
            query?: URLSearchQuery,
            headers?: HeadersInit,
        ): Promise<T> {
            return apiCall<T>(
                `${pathname}${query ? "?" : ""}${new URLSearchParams(
                    query,
                ).toString()}`,
                {
                    method: "GET",
                    headers,
                },
            );
        },
        post<T>(
            pathname: string,
            body: any,
            headers?: HeadersInit,
        ): Promise<T> {
            return apiCall<T>(pathname, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
            });
        },
        postFile<T>(pathname: string, file: FormData): Promise<T> {
            return zproxyStorageCall<T>(pathname, {
                method: "POST",
                body: file,
                // headers NOT required when passing FormData object
            });
        },
    };

    function sleep(ms: number): Promise<undefined> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function Promised<T>(): PromisedValue<T> {
        let resolve = (() => {}) as (value: T | PromiseLike<T>) => void;
        let reject = (() => {}) as (reason: Error | string | undefined) => void;

        return Object.assign(
            new Promise<T>((_resolve, _reject) => {
                resolve = _resolve;
                reject = _reject;
            }),
            {
                resolve,
                reject,
            },
        );
    }

    function SubscriptionTimeout(ms: number): Promise<undefined> {
        return new Promise((_, reject) =>
            setTimeout(
                () =>
                    reject(
                        new SubscriptionRequestTimeout(
                            "Subscription confirmation timeout",
                        ),
                    ),
                ms,
            ),
        );
    }

    const socketsByHost: Record<string, WebSocket> = {};
    const messagesBySubscriptionId: SubscriptionMessages = {};
    const errorsBySubscriptionId: SubscriptionErrors = {};

    const SUBSCRIPTION_EVENT_TYPES = {
        CONFIRMATION: "subscription_confirmation",
        CANCELLATION: "subscription_cancellation",
        EVENT: "subscription_event",
        ERROR: "subscription_error",
    };

    const SUBSCRIPTION_REQUEST_TYPES = {
        SUBSCRIBE: "subscribeContractEvent",
        UNSUBSCRIBE: "removeSubscriptionById",
    };

    const getSubscriptionRequestId = ({
        type,
        params: { contract, event } = {},
    }: MessageQueueConfig) => `${type}_${contract}_${event}`;

    const getMessageQueue = <T>(subscriptionId: string): T[] =>
        messagesBySubscriptionId[subscriptionId] ||
        (messagesBySubscriptionId[subscriptionId] = []);

    const subscriptionIdsByRequestId: Record<string, PromisedValue<string>> =
        {};

    const wsConnect = (
        host: string,
        { messageQueueSizeLimit = 1000 } = {} as ZProxyWSOptions,
    ): Promise<ZProxyWS | undefined> =>
        new Promise((resolve, reject) => {
            if (socketsByHost[host] !== undefined) {
                resolve(socketsByHost[host] as ZProxyWS);
                return;
            }

            const ws = new WebSocket(host);

            ws.onopen = () =>
                resolve(
                    Object.assign((socketsByHost[host] = ws), {
                        async subscribeToContractEvent<T>(
                            params: SubscriptionParams,
                        ): Promise<() => Promise<T>> {
                            const metaData = {
                                type: SUBSCRIPTION_REQUEST_TYPES.SUBSCRIBE,
                                params,
                            };
                            const requestId =
                                getSubscriptionRequestId(metaData);

                            subscriptionIdsByRequestId[requestId] =
                                Promised<string>();

                            await ws.send(JSON.stringify(metaData));

                            const subscriptionId = (await Promise.race([
                                subscriptionIdsByRequestId[requestId],
                                SubscriptionTimeout(10000),
                            ])) as string;

                            const queue = getMessageQueue<T>(subscriptionId);

                            return Object.assign(
                                async (): Promise<T> => {
                                    while (true) {
                                        try {
                                            const queueError =
                                                errorsBySubscriptionId[
                                                    subscriptionId
                                                ];
                                            if (queueError) {
                                                throw queueError;
                                            }
                                            if (queue.length) {
                                                return queue.shift() as T;
                                            } else {
                                                await sleep(100);
                                            }
                                        } catch (e) {
                                            console.error(
                                                "subscribed message error:",
                                                e,
                                            );
                                            throw e;
                                        }
                                    }
                                },
                                {
                                    unsubscribe() {
                                        return ws.send(
                                            JSON.stringify({
                                                type: SUBSCRIPTION_REQUEST_TYPES.UNSUBSCRIBE,
                                                params: { subscriptionId },
                                            }),
                                        );
                                    },
                                },
                            );
                        },
                    }) as ZProxyWS,
                );

            ws.onerror = (e) => {
                for (const queueId in messagesBySubscriptionId) {
                    if (!errorsBySubscriptionId[queueId]) {
                        errorsBySubscriptionId[queueId] =
                            new ZProxyWSConnectionError(e.toString());
                    }
                }
            };

            ws.onclose = (e) => {
                delete socketsByHost[host];

                for (const queueId in messagesBySubscriptionId) {
                    if (!errorsBySubscriptionId[queueId]) {
                        errorsBySubscriptionId[queueId] =
                            new ZProxyWSConnectionClosed(e.toString());
                    }
                }

                if (e.code === 1000) {
                    resolve(undefined); // closed intentionally
                } else {
                    reject();
                }
            };

            ws.onmessage = (e) => {
                try {
                    const {
                        type,
                        request,
                        subscriptionId,
                        data,
                    }: SubscriptionEvent<unknown> = JSON.parse(e.data);

                    switch (type) {
                        case SUBSCRIPTION_EVENT_TYPES.CONFIRMATION: {
                            const requestId = getSubscriptionRequestId(request);
                            const { resolve, reject } =
                                subscriptionIdsByRequestId[requestId] || {};

                            if (typeof subscriptionId !== "string") {
                                if (typeof reject === "function") {
                                    reject(
                                        new SubscriptionError(
                                            `Invalid subscription id "${subscriptionId}" for request id: "${requestId}"`,
                                        ),
                                    );
                                }
                            } else if (typeof resolve === "function") {
                                resolve(subscriptionId);
                            }
                            break;
                        }

                        case SUBSCRIPTION_EVENT_TYPES.CANCELLATION: {
                            if (subscriptionId) {
                                console.info({
                                    type,
                                    request,
                                    subscriptionId,
                                    data,
                                });

                                delete messagesBySubscriptionId[subscriptionId];
                                delete errorsBySubscriptionId[subscriptionId];
                            }
                            break;
                        }

                        case SUBSCRIPTION_EVENT_TYPES.EVENT: {
                            if (subscriptionId) {
                                const queue = getMessageQueue(subscriptionId);

                                if (queue.length > messageQueueSizeLimit) {
                                    errorsBySubscriptionId[subscriptionId] =
                                        new MessageQueueOverflow(
                                            "ZProxy WS message queue overflow",
                                        );
                                } else {
                                    queue.push(data);
                                }
                            } else {
                                console.error(
                                    "Unable to identify subscription channel",
                                    {
                                        subscriptionId,
                                        request,
                                        data,
                                    },
                                );
                            }
                            break;
                        }

                        case SUBSCRIPTION_EVENT_TYPES.ERROR: {
                            if (subscriptionId) {
                                errorsBySubscriptionId[subscriptionId] =
                                    new SubscriptionError(JSON.stringify(data));
                            } else {
                                console.error(
                                    "Unable to identify subscription channel",
                                    {
                                        subscriptionId,
                                        request,
                                        data,
                                    },
                                );
                            }
                            break;
                        }

                        default: {
                            console.error("Unsupported event type:", {
                                type,
                                request,
                                subscriptionId,
                                data,
                            });
                        }
                    }
                } catch (e) {
                    console.log("Web Socket onmessage error:", e);
                }
            };
        });

    return {
        version: version,
        status: {
            ping: () =>
                api.get<"pong">("status/ping", undefined, getAuthHeaders()),
        },
        contract: {
            load: <T>({ contract, ...args }: ContractLoadRequest) =>
                api.get<T>(`contract/load/${contract}`, args, getAuthHeaders()),
            call: <T>(args: ContractCallRequest) =>
                api.post<T>("contract/call", args, getAuthHeaders()),
            send: <T>(args: ContractSendRequest) =>
                api.post<T>("contract/send", args, getAuthHeaders()),
            async subscribe<T>({
                contract,
                event,
                ...options
            }: SubscriptionParams) {
                if (typeof contract !== "string") {
                    throw new PointSDKRequestError(
                        `Invalid contract ${contract}`,
                    );
                }
                if (typeof event !== "string") {
                    throw new PointSDKRequestError(`Invalid event ${event}`);
                }

                const url = new URL(host);
                url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
                const socket = await wsConnect(url.toString());

                if (!socket) {
                    throw new PointSDKRequestError(
                        "Failed to establish web socket connection",
                    );
                }

                return socket.subscribeToContractEvent<T>({
                    contract,
                    event,
                    ...options,
                });
            },
        },
        storage: {
            postFile: <T>(file: FormData) => api.postFile<T>("_storage/", file),
            getString: <T>({ id, ...args }: StorageGetRequest) =>
                api.get<T>(`storage/getString/${id}`, args, getAuthHeaders()),
            putString: <T>(data: StoragePutStringRequest) =>
                api.post<T>("storage/putString", data, getAuthHeaders()),
        },
        wallet: {
            address: () => api.get<string>("wallet/address"),
            hash: () => api.get<string>("wallet/hash"),
            publicKey: () =>
                api.get<string>("wallet/publicKey", {}, getAuthHeaders()),
            balance: () => api.get<number>("wallet/balance"),
            encryptData: <T>({
                publicKey,
                data,
                ...args
            }: EncryptDataRequest) =>
                api.post<T>(
                    "wallet/encryptData",
                    {
                        publicKey,
                        data,
                        ...args,
                    },
                    getAuthHeaders(),
                ),
            decryptData: <T>({ data, ...args }: DecryptDataRequest) =>
                api.post<T>(
                    "wallet/decryptData",
                    {
                        data,
                        ...args,
                    },
                    getAuthHeaders(),
                ),
        },
        identity: {
            publicKeyByIdentity: <T>({
                identity,
                ...args
            }: PublicKeyByIdentityRequest) =>
                api.get<T>(
                    `identity/publicKeyByIdentity/${identity}`,
                    args,
                    getAuthHeaders(),
                ),
            identityToOwner: <T>({
                identity,
                ...args
            }: IdentityToOwnerRequest) =>
                api.get<T>(
                    `identity/identityToOwner/${identity}`,
                    args,
                    getAuthHeaders(),
                ),
            ownerToIdentity: <T>({ owner, ...args }: OwnerToIdentityRequest) =>
                api.get<T>(
                    `identity/ownerToIdentity/${owner}`,
                    args,
                    getAuthHeaders(),
                ),
        },
    };
};

export default getSdk;
