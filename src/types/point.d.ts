export type ContractCallRequest = {
    contract: string,
    method: string,
    params?: unknown[],
};

export type PointType = {
    contract: {
        call: (request: ContractCallRequest) => Promise<unknown>;
        send: () => Promise<boolean>;
    };
    storage: {
        get: () => Promise<boolean>;
    };
    wallet: {
        address: () => Promise<string>;
        hash: () => Promise<string>;
    };
};
