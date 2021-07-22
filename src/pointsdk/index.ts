import {
    ZProxyWS,
    PointType,
    MessageQueues,
    URLSearchQuery,
    StorageGetRequest,
    ContractCallRequest,
    ContractSendRequest,
    ContractEventMessage,
    ContractEventSubscription,
    ContractEventMessageMetaData,
} from './index.d';

export default (host: string): PointType => {
    class PointSDKRequestError extends Error {};

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
    const messageQueuesById: MessageQueues = { default: [] };
    const MessageTypes = {
        ContractEvent: 'subscribeContractEvent',
    };

    const getMessageQueue = <T>({ type, params: { contract, event } = {}}: ContractEventMessageMetaData): T[] => {
        if (type !== MessageTypes.ContractEvent) {
            return messageQueuesById.default as T[];
        }

        const queueId = type + contract + event;
        return messageQueuesById[queueId] || (messageQueuesById[queueId] = []) as T[];
    };

    const wsConnect = (host: string): Promise<ZProxyWS | undefined> => new Promise((resolve, reject) => {
        if (socketsByHost[host] !== undefined) {
            resolve(socketsByHost[host] as ZProxyWS);
        }

        const ws = new WebSocket(host);

        ws.onopen = () => resolve(Object.assign(socketsByHost[host] = ws, {
            async subscribeToContractEvent<T>(params: ContractEventSubscription): Promise<() => Promise<T>> {
                const metaData = { type: MessageTypes.ContractEvent, params };
                await ws.send(JSON.stringify(metaData));

                const queue = getMessageQueue<T>(metaData);
                return async (): Promise<T> => {
                    while (true) {
                        if (queue.length) {
                            return queue.shift() as T;
                        } else {
                            await sleep(100);
                        }
                    }
                };
            }
        }) as ZProxyWS);

        ws.onerror = (e) => console.error('WS error:', e);

        ws.onclose = (e) => {
            delete socketsByHost[host];
            if (e.code === 1000) {
                resolve(undefined); // closed intentionally
            } else {
                reject();
            }
        };

        ws.onmessage = (e) => {
            const { type, params, data }: ContractEventMessage<unknown> = JSON.parse(e.data);
            getMessageQueue({ type, params }).push(data);
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

                const socket = await wsConnect(host.replace(/https?/, 'wss'));

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
