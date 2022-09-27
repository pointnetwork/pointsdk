import {
    ZProxyWS,
    PointType,
    PromisedValue,
    URLSearchQuery,
    ZProxyWSOptions,
    StorageGetRequest,
    StoragePutStringRequest,
    OwnerToIdentityRequest,
    PublicKeyByIdentityRequest,
    IdentityToOwnerRequest,
    EncryptDataRequest,
    DecryptDataRequest,
    SubscriptionErrors,
    MessageQueueConfig,
    ContractLoadRequest,
    ContractCallRequest,
    ContractSendRequest,
    ContractEventsRequest,
    SubscriptionMessages,
    SubscriptionEvent,
    SubscriptionParams,
    IdentityData,
} from "./index.d";

const getSdk = (host: string, version: string, swal: any): PointType => {
    class PointSDKRequestError extends Error {}
    class MessageQueueOverflow extends Error {}
    class ZProxyWSConnectionError extends Error {}
    class ZProxyWSConnectionClosed extends Error {}
    class SubscriptionRequestTimeout extends Error {}
    class SubscriptionError extends Error {}

    const gatewayAlert = async () => {
        swal.fire({
            title: "Demo mode",
            html: `You cannot make writing operations right here but you can download Point Browser and have the full web3 experience. 
<a href="https://pointnetwork.io/download" target="_blank" rel="noopener noreferrer">https://pointnetwork.io/download</a>`,
            icon: "info",
        });
    };

    const getAuthToken = async () =>
        window.top.IS_GATEWAY
            ? window.top.POINT_JWT
            : new Promise<string>((resolve, reject) => {
                  const id = Math.random();

                  const handler = (e: MessageEvent) => {
                      if (
                          e.data.__page_req_id === id &&
                          e.data.__direction === "to_page"
                      ) {
                          window.removeEventListener("message", handler);
                          if (e.data.code) {
                              reject({
                                  code: e.data.code,
                                  message: e.data.message,
                              });
                          } else {
                              resolve(e.data.token);
                          }
                      }
                  };

                  window.addEventListener("message", handler);

                  window.postMessage({
                      __page_req_id: id,
                      __message_type: "getAuthToken",
                      __direction: "to_bg",
                  });
              });

    const apiCall = async <T>(
        path: string,
        config?: RequestInit,
        internal?: boolean,
    ) => {
        try {
            const token = await getAuthToken();
            // @ts-ignore, https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#xhr_and_fetch
            const response = await window.top.fetch(
                `${host}${internal ? "/point_api/" : "/v1/api/"}${path}`,
                {
                    cache: "no-cache",
                    credentials: "include",
                    keepalive: true,
                    ...config,
                    headers: {
                        "Content-Type": "application/json",
                        "X-Point-Token": `Bearer ${token}`,
                        ...config?.headers,
                    },
                },
            );

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
            const token = await getAuthToken();
            // @ts-ignore, https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#xhr_and_fetch
            const response = await window.top.fetch(`${host}/${path}`, {
                cache: "no-cache",
                credentials: "include",
                keepalive: true,
                ...config,
                headers: {
                    "X-Point-Token": `Bearer ${token}`,
                    ...(config?.headers ?? {}),
                },
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
            internal?: boolean,
        ): Promise<T> {
            return apiCall<T>(
                `${pathname}${query ? "?" : ""}${new URLSearchParams(
                    query,
                ).toString()}`,
                {
                    method: "GET",
                    headers,
                },
                internal,
            );
        },
        post<T>(
            pathname: string,
            body: any,
            headers?: HeadersInit,
            internal?: boolean,
        ): Promise<T> {
            return apiCall<T>(
                pathname,
                {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        ...body,
                        _csrf: window.localStorage.getItem("csrf_token"),
                    }),
                },
                internal,
            );
        },
        postFile<T>(pathname: string, file: FormData): Promise<T> {
            return zproxyStorageCall<T>(pathname, {
                method: "POST",
                body: file,
                // headers NOT required when passing FormData object
            });
        },
        encryptAndPostFile<T>(
            pathname: string,
            file: FormData,
            identities: string[],
            metadata?: string[],
        ): Promise<T> {
            return zproxyStorageCall<T>(pathname, {
                method: "POST",
                body: file,
                headers: {
                    identities: identities.join(","),
                    metadata: metadata?.join(",") ?? "",
                },
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
                                __point_token: await getAuthToken(),
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
                                    async unsubscribe() {
                                        return ws.send(
                                            JSON.stringify({
                                                type: SUBSCRIPTION_REQUEST_TYPES.UNSUBSCRIBE,
                                                params: { subscriptionId },
                                                __point_token:
                                                    await getAuthToken(),
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
                if (e.code === 1000 || e.code === 1001) {
                    // 1000 -> CLOSE_NORMAL (normal socket shut down)
                    // 1001 -> CLOSE_GOING_AWAY (closing browser tab, refreshing, navigating away)
                    resolve(undefined); // closed intentionally
                } else {
                    for (const queueId in messagesBySubscriptionId) {
                        if (!errorsBySubscriptionId[queueId]) {
                            errorsBySubscriptionId[queueId] =
                                new ZProxyWSConnectionClosed(e.toString());
                        }
                    }
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
                    console.error("Web Socket onmessage error:", e);
                }
            };
        });

    const waitForNodeResponse = (messageId: string) =>
        new Promise((resolve, reject) => {
            const id = Math.random();

            const handler = (e: MessageEvent) => {
                if (
                    e.data.__page_req_id === id &&
                    e.data.__direction === "to_page"
                ) {
                    window.removeEventListener("message", handler);
                    if (e.data.code) {
                        reject({
                            code: e.data.code,
                            message: e.data.message,
                        });
                    } else {
                        resolve(e.data.result);
                    }
                }
            };

            window.addEventListener("message", handler);

            window.postMessage({
                messageId,
                __message_type: "registerHandler",
                __page_req_id: id,
                __direction: "to_bg",
            });
        });

    return {
        version: version,
        status: {
            ping: () => api.get<"pong">("status/ping"),
        },
        contract: {
            load: <T>({ contract, ...args }: ContractLoadRequest) =>
                api.get<T>(`contract/load/${contract}`, args),
            call: async <T>({
                contract,
                method,
                params,
            }: ContractCallRequest) => {
                if (window.top.IS_GATEWAY) {
                    const res = await api.post("contract/safe_call", {
                        contract,
                        method,
                        params,
                    });
                    return res.data;
                }

                const {
                    data: { abi, address },
                } = await api.get(`contract/load/${contract}`, {});

                const jsonInterface = abi.find(
                    (entry) => entry.name === method,
                );
                if (!jsonInterface) {
                    throw new Error(
                        `Method ${method} not found in contract ${contract}`,
                    );
                }

                const preparedParams = params ?? [];
                if (preparedParams.length !== jsonInterface.inputs.length) {
                    throw new Error(
                        `Invalid number of params, expected ${jsonInterface.inputs.length}, got ${preparedParams.length}`,
                    );
                }

                for (let i = 0; i < preparedParams.length; i++) {
                    if (
                        jsonInterface.inputs[i].internalType === "bytes32" &&
                        typeof preparedParams[i] === "string" &&
                        !preparedParams[i].startsWith("0x")
                    ) {
                        preparedParams[i] = `0x${preparedParams[i]}`;
                    }
                }

                const { data } = await api.post("contract/encodeFunctionCall", {
                    jsonInterface,
                    params: preparedParams,
                });

                const accounts = await window.top.ethereum.request({
                    method: "eth_requestAccounts",
                });

                switch (jsonInterface.stateMutability) {
                    case "view":
                    case "pure":
                        const rawRes = await window.top.ethereum.request({
                            method: "eth_call",
                            params: [
                                {
                                    from: accounts[0],
                                    to: address,
                                    data,
                                },
                                "latest",
                            ],
                        });

                        const decodedRes = await api.post(
                            "contract/decodeParameters",
                            {
                                typesArray: jsonInterface.outputs,
                                hexString: rawRes,
                            },
                        );

                        return { data: decodedRes.data[0] };
                    case "nonpayable":
                        return window.top.ethereum.request({
                            meta: { contract },
                            method: "eth_sendTransaction",
                            params: [
                                {
                                    from: accounts[0],
                                    to: address,
                                    data,
                                },
                            ],
                        });
                    case "payable":
                        throw new Error(
                            "Do not use call for payable functions, use send instead",
                        );
                    default:
                        throw new Error(
                            `Unexpected function state mutability ${jsonInterface.stateMutability}`,
                        );
                }
            },
            send: window.top.IS_GATEWAY
                ? gatewayAlert
                : async <T>({
                      contract,
                      method,
                      params,
                      value,
                  }: ContractSendRequest) => {
                      const {
                          data: { abi, address },
                      } = await api.get(`contract/load/${contract}`, {});

                      const accounts = await window.top.ethereum.request({
                          method: "eth_requestAccounts",
                      });

                      const jsonInterface = abi.find(
                          (entry) => entry.name === method,
                      );
                      if (!jsonInterface) {
                          throw new Error(
                              `Method ${method} not found in contract ${contract}`,
                          );
                      }

                      const preparedParams = params ?? [];
                      if (
                          preparedParams.length !== jsonInterface.inputs.length
                      ) {
                          throw new Error(
                              `Invalid number of params, expected ${jsonInterface.inputs.length}, got ${preparedParams.length}`,
                          );
                      }

                      for (let i = 0; i < preparedParams.length; i++) {
                          if (
                              jsonInterface.inputs[i].internalType ===
                                  "bytes32" &&
                              typeof preparedParams[i] === "string" &&
                              !preparedParams[i].startsWith("0x")
                          ) {
                              preparedParams[i] = `0x${preparedParams[i]}`;
                          }
                      }

                      if (
                          ["view", "pure"].includes(
                              jsonInterface.stateMutability,
                          )
                      ) {
                          throw new Error(
                              `Method ${method} is a view one, use call instead of send`,
                          );
                      }

                      const { data } = await api.post(
                          "contract/encodeFunctionCall",
                          {
                              jsonInterface,
                              params: params ?? [],
                          },
                      );

                      return window.top.ethereum.request({
                          meta: { contract },
                          method: "eth_sendTransaction",
                          params: [
                              {
                                  from: accounts[0],
                                  to: address,
                                  data,
                                  value,
                              },
                          ],
                      });
                  },
            events: <T>(args: ContractEventsRequest) =>
                api.post<T>("contract/events", args),
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
                url.pathname += url.pathname.endsWith("/") ? "ws" : "/ws";
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
            postFile: window.top.IS_GATEWAY
                ? gatewayAlert
                : <T>(file: FormData) => api.postFile<T>("_storage/", file),
            encryptAndPostFile: <T>(
                file: FormData,
                identities: string[],
                metadata?: string[],
            ) =>
                window.top.IS_GATEWAY
                    ? gatewayAlert
                    : api.encryptAndPostFile<T>(
                          "_encryptedStorage/",
                          file,
                          identities,
                          metadata,
                      ),
            getString: <T>({ id, ...args }: StorageGetRequest) =>
                api.get<T>(`storage/getString/${id}`, args),
            getFile: async ({ id }) => {
                const token = await getAuthToken();
                const res = await window.top.fetch(`${host}/_storage/${id}`, {
                    headers: {
                        "X-Point-Token": `Bearer ${token}`,
                    },
                });
                return res.blob();
            },
            getEncryptedFile: async ({ id, eSymmetricObj, symmetricObj }) => {
                if (!!eSymmetricObj === !!symmetricObj) {
                    throw new Error(
                        "Either eSymmetricObj or symmetricObj should be specified, and only one of them",
                    );
                }
                const token = await getAuthToken();
                const res = await window.top.fetch(
                    `${host}/_encryptedStorage/${id}${
                        eSymmetricObj ? `?eSymmetricObj=${eSymmetricObj}` : ""
                    }${symmetricObj ? `?symmetricObj=${symmetricObj}` : ""}`,
                    {
                        headers: {
                            "X-Point-Token": `Bearer ${token}`,
                        },
                    },
                );
                return res.blob();
            },
            putString: window.top.IS_GATEWAY
                ? gatewayAlert
                : <T>(data: StoragePutStringRequest) =>
                      api.post<T>("storage/putString", data),
        },
        wallet: {
            address: () => api.get<string>("wallet/address"),
            ...(host === "https://confirmation-window" && !window.top.IS_GATEWAY
                ? {
                      hash: () => api.get<string>("wallet/hash", {}, {}, true),
                  }
                : {}),
            publicKey: () => api.get<string>("wallet/publicKey", {}),
            balance: (network) => {
                if (!network) {
                    throw new Error("No network specified");
                }
                return api.get<number>("wallet/balance", { network });
            },
            send: window.top.IS_GATEWAY
                ? gatewayAlert
                : async ({ to, network, value }) => {
                      const { networks, default_network } = await api.get(
                          "blockchain/networks",
                      );
                      const chain = network ?? default_network;
                      if (!networks[chain]) {
                          throw new Error(`Unknown network ${chain}`);
                      }
                      switch (networks[chain].type) {
                          case "eth":
                              const accounts =
                                  await window.top.ethereum.request({
                                      method: "eth_requestAccounts",
                                  });

                              return window.top.ethereum.request({
                                  method: "eth_sendTransaction",
                                  params: [
                                      {
                                          from: accounts[0],
                                          to,
                                          value,
                                      },
                                  ],
                                  chain,
                              });
                          case "solana":
                              return window.top.solana.request({
                                  method: "solana_sendTransaction",
                                  params: [
                                      {
                                          to,
                                          lamports: value,
                                      },
                                  ],
                                  chain,
                              });
                          default:
                              throw new Error(
                                  `Unexpected network type ${networks[chain].type}`,
                              );
                      }
                  },
            encryptData: window.top.IS_GATEWAY
                ? gatewayAlert
                : <T>({ publicKey, data, ...args }: EncryptDataRequest) =>
                      api.post<T>("wallet/encryptData", {
                          publicKey,
                          data,
                          ...args,
                      }),
            decryptData: window.top.IS_GATEWAY
                ? gatewayAlert
                : <T>({ data, ...args }: DecryptDataRequest) =>
                      api.post<T>("wallet/decryptData", {
                          data,
                          ...args,
                      }),
            decryptSymmetricKey: window.top.IS_GATEWAY
                ? gatewayAlert
                : <T>({ data, ...args }: DecryptDataRequest) =>
                      api.post<T>("wallet/decryptSymmetricKey", {
                          data,
                          ...args,
                      }),
            decryptDataWithDecryptedKey: window.top.IS_GATEWAY
                ? gatewayAlert
                : <T>({ data, ...args }: DecryptDataRequest) =>
                      api.post<T>("wallet/decryptDataWithDecryptedKey", {
                          data,
                          ...args,
                      }),
        },
        identity: {
            publicKeyByIdentity: <T>({
                identity,
                ...args
            }: PublicKeyByIdentityRequest) =>
                api.get<T>(`identity/publicKeyByIdentity/${identity}`, args),
            identityToOwner: <T>({
                identity,
                ...args
            }: IdentityToOwnerRequest) =>
                api.get<T>(`identity/identityToOwner/${identity}`, args),
            ownerToIdentity: <T>({ owner, ...args }: OwnerToIdentityRequest) =>
                api.get<T>(`identity/ownerToIdentity/${owner}`, args),
            me: () => api.get<IdentityData>("identity/isIdentityRegistered/"),
        },
        ...(host === "https://point" && !window.top.IS_GATEWAY
            ? {
                  point: {
                      wallet_send: async ({ to, network, value }) => {
                          const messageId = String(Math.random());
                          await Promise.all([
                              waitForNodeResponse(messageId),
                              (async () => {
                                  const res = await api.post(
                                      "wallet/send",
                                      {
                                          to,
                                          network,
                                          value,
                                          messageId,
                                      },
                                      {},
                                      true,
                                  );
                                  if (res.status !== 200) {
                                      throw new Error("Failed to send token");
                                  }
                              })(),
                          ]);
                      },
                      wallet_send_token: async ({
                          to,
                          network,
                          tokenAddress,
                          value,
                      }) => {
                          const messageId = String(Math.random());
                          await Promise.all([
                              waitForNodeResponse(messageId),
                              (async () => {
                                  const res = await api.post(
                                      "wallet/sendToken",
                                      {
                                          to,
                                          network,
                                          value,
                                          tokenAddress,
                                          messageId,
                                      },
                                      {},
                                      true,
                                  );
                                  if (res.status !== 200) {
                                      throw new Error("Failed to send token");
                                  }
                              })(),
                          ]);
                      },
                      set_auth_token: (token: string) =>
                          new Promise((resolve, reject) => {
                              const id = Math.random();

                              const handler = (e: MessageEvent) => {
                                  if (
                                      e.data.__page_req_id === id &&
                                      e.data.__direction === "to_page"
                                  ) {
                                      window.removeEventListener(
                                          "message",
                                          handler,
                                      );
                                      if (e.data.code) {
                                          reject({
                                              code: e.data.code,
                                              message: e.data.message,
                                          });
                                      } else {
                                          resolve(e.data);
                                      }
                                  }
                              };

                              window.addEventListener("message", handler);

                              window.postMessage({
                                  token,
                                  __page_req_id: id,
                                  __message_type: "setAuthToken",
                                  __direction: "to_bg",
                              });
                          }),
                      get_auth_token: getAuthToken,
                      link_point_to_sol: (domain: string) => {
                          return window.top.solana.request({
                              method: "solana_snsWriteRequest",
                              params: [{ domain }],
                          });
                      },
                  },
              }
            : {}),
    };
};

export default getSdk;
