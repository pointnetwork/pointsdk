export type ContractCallRequest = { contract: string, method: string, params?: unknown[] };

export type ContractSendRequest = { contract: string, method: string, params?: unknown[] };

export type URLSearchQuery = ConstructorParameters<typeof URLSearchParams>[0];

export type StorageGetRequest = { id: string, encoding?: string } & Record<string, string>;

export type ContractEventSubscription = { contract: string, event: string } & Record<string, unknown> /* options */;

export type ContractEventMessageMetaData = { type: string, params: ContractEventSubscription };

export type MessageQueueConfig = { type: string, params?: ContractEventSubscription | Record<string, unknown> };

export type ContractEventMessage<T> = ContractEventMessageMetaData & { data: T };

export type MessageQueues = { [name: string]: any[] };

export type ErrorsByQueue = { [name: string]: Error | null };

export type ZProxyWSOptions = {
    messageQueueSizeLimit?: number,
};

export type ZProxyWS = WebSocket & {
    subscribeToContractEvent: <T>(cfg: ContractEventSubscription) => Promise<() => Promise<T>>,
};

export type PointType = {
    status: {
        ping: () => Promise<'pong'>,
    },
    contract: {
        call: <T>(request: ContractCallRequest) => Promise<T>,
        send: <T>(request: ContractSendRequest) => Promise<T>,
        subscribe: <T>(request: ContractEventSubscription) => Promise<() => Promise<T>>,
    },
    storage: {
        get: <T>(request: StorageGetRequest) => Promise<T>,
    },
    wallet: {
        address: () => Promise<string>,
        hash: () => Promise<string>,
    },
};
