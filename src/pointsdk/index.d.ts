export type ContractCallRequest = {
    contract: string,
    method: string,
    params?: unknown[],
};

export type ContractSendRequest = {
    contract: string,
    method: string,
    params?: unknown[],
};

export type StorageGetRequest = {
    id: string,
    encoding?: string,
};

export type PointType = {
    status: {
        ping: () => Promise<'pong'>
    },
    contract: {
        call: (request: ContractCallRequest) => Promise<unknown>;
        send: (request: ContractSendRequest) => Promise<unknown>;
    };
    storage: {
        get: (request: StorageGetRequest) => Promise<unknown>;
    };
    wallet: {
        address: () => Promise<string>;
        hash: () => Promise<string>;
    };
};
