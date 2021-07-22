import {
    ZProxyWS,
    PointType,
    MessageQueues,
    ErrorsByQueue,
    URLSearchQuery,
    ZProxyWSOptions,
    StorageGetRequest,
    MessageQueueConfig,
    ContractCallRequest,
    ContractSendRequest,
    ContractEventMessage,
    ContractEventSubscription,
} from './index.d';

export default (host: string): PointType => {
    class PointSDKRequestError extends Error {};
    class MessageQueueOverflow extends Error {};
    class ZProxyWSConnectionError extends Error {};
    class ZProxyWSConnectionClosed extends Error {};

    // const getAuthHeaders = () => ({ Authorization: 'Basic ' + btoa('WALLETID-PASSCODE') });
    const getAuthHeaders = (): HeadersInit => ({ 'wallet-token': 'WALLETID-PASSCODE' });

    const apiCall = async <T>(path: string, config?: RequestInit) => {
        try {
            // @ts-ignore, https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#xhr_and_fetch
            const response = await window.top.fetch(`${ host }/v1/api/${ path }`, {
                cache: 'no-cache',
                credentials: 'include',
                keepalive: true,
                ...config,
                headers: {
                    'Content-Type': 'application/json',
                    ...config?.headers
                }
            });

            if (!response.ok) {
                const {ok, status, statusText, headers} = response;
                console.error('SDK call failed:', {
                    // @ts-ignore
                    ok, status, statusText, headers: Object.fromEntries([ ...headers.entries() ])
                });
                throw new PointSDKRequestError('Point SDK request failed');
            }

            try {
                return await response.json() as T;
            } catch (e) {
                console.error('Point API response parsing error:', e);
                throw e;
            }
        } catch (e) {
            console.error('Point API call failed:', e);
            throw e;
        }
    };

    const api = {
        get<T>(pathname: string, query?: URLSearchQuery, headers?: HeadersInit): Promise<T> {
            return apiCall<T>(`${ pathname }${ query ? '?' : '' }${ new URLSearchParams(query).toString() }`, {
                method: 'GET',
                headers,
            });
        },
        post<T>(pathname: string, body: any, headers?: HeadersInit): Promise<T> {
            return apiCall<T>(pathname, { method: 'POST', headers, body: JSON.stringify(body) })
        },
    };

    function sleep(ms: number): Promise<undefined> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    const socketsByHost: Record<string, WebSocket> = {};
    const messageQueuesById: MessageQueues = {};
    const errorsByQueueId: ErrorsByQueue = {};
    const MessageTypes = {
        ContractEvent: 'subscribeContractEvent',
    };

    const getMessageQueueId = ({ type, params: { contract = '', event = '' } = {}}: MessageQueueConfig): string => {
        switch (type) {
            case MessageTypes.ContractEvent: return type + contract + event;
            default: return 'default'
        }
    }

    const getMessageQueue = <T>(queueId: string): T[] => (
        messageQueuesById[queueId] || (messageQueuesById[queueId] = [])
    );

    const wsConnect = (
        host: string,
        { messageQueueSizeLimit = 1000 } = {} as ZProxyWSOptions
    ): Promise<ZProxyWS | undefined> => new Promise((resolve, reject) => {
        if (socketsByHost[host] !== undefined) {
            resolve(socketsByHost[host] as ZProxyWS);
        }

        const ws = new WebSocket(host);

        ws.onopen = () => resolve(Object.assign(socketsByHost[host] = ws, {
            async subscribeToContractEvent<T>(params: ContractEventSubscription): Promise<() => Promise<T>> {
                const metaData = { type: MessageTypes.ContractEvent, params };
                await ws.send(JSON.stringify(metaData));

                const queueId = getMessageQueueId(metaData);
                const queue = getMessageQueue<T>(queueId);
                return async (): Promise<T> => {
                    while (true) {
                        const queueError = errorsByQueueId[queueId];
                        if (queueError) {
                            throw queueError;
                        } if (queue.length) {
                            return queue.shift() as T;
                        } else {
                            await sleep(100);
                        }
                    }
                };
            }
        }) as ZProxyWS);

        ws.onerror = (e) => {
            for (const queueId in messageQueuesById) {
                if (!errorsByQueueId[queueId]) {
                    errorsByQueueId[queueId] = new ZProxyWSConnectionError(e.toString());
                }
            }
        };

        ws.onclose = (e) => {
            delete socketsByHost[host];

            for (const queueId in messageQueuesById) {
                if (!errorsByQueueId[queueId]) {
                    errorsByQueueId[queueId] = new ZProxyWSConnectionClosed(e.toString());
                }
            }

            if (e.code === 1000) {
                resolve(undefined); // closed intentionally
            } else {
                reject();
            }
        };

        ws.onmessage = (e) => {
            const { type, params, data }: ContractEventMessage<unknown> = JSON.parse(e.data);
            const queueId = getMessageQueueId({ type, params });
            if (errorsByQueueId[queueId]) {
                return;
            }

            const queue = getMessageQueue(queueId);

            if (queue.length > messageQueueSizeLimit) {
                errorsByQueueId[queueId] = new MessageQueueOverflow('ZProxy WS message queue overflow');
            } else {
                queue.push(data);
            }
        };
    });

    return {
        status: {
            ping: () => api.get<'pong'>('status/ping', undefined, getAuthHeaders()),
        },
        contract: {
            call: <T>(args: ContractCallRequest) => api.post<T>('contract/call', args, getAuthHeaders()),
            send: <T>(args: ContractSendRequest) => api.post<T>('contract/send', args, getAuthHeaders()),
            async subscribe<T>({ contract, event, ...options }: ContractEventSubscription) {
                if (typeof contract !== 'string') {
                    throw new PointSDKRequestError(`Invalid contract ${ contract }`);
                }
                if (typeof event !== 'string') {
                    throw new PointSDKRequestError(`Invalid event ${ event }`);
                }
                
                const url = new URL(host);
                url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
                const socket = await wsConnect(url.toString());

                if (!socket) {
                    throw new PointSDKRequestError(`Failed to establish web socket connection`);
                }

                return socket.subscribeToContractEvent<T>({ contract, event, ...options });
            }
        },
        storage: {
            get: <T>({ id, ...args }: StorageGetRequest) => api.get<T>(`storage/get/${ id }`, args, getAuthHeaders()),
        },
        wallet: {
            address: () => api.get<string>('wallet/address'),
            hash: () => api.get<string>('wallet/hash'),
        },
    };
}
