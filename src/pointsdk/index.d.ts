export type PromisedValue<T> = Promise<T> & {
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason: Error | string | undefined) => void;
};

export type ContractLoadRequest = {
    contract: string;
    params?: unknown[];
} & Record<string, string>;

export type ContractCallRequest = {
    contract: string;
    method: string;
    params?: unknown[];
};

export type ContractEventsRequest = {
    host: string;
    contractName: string;
    event: string;
    filter?: Object;
};

export type ContractSendRequest = {
    contract: string;
    method: string;
    params?: unknown[];
    value: string;
};

export type WalletSendRequest = {
    to: string;
    network?: string;
    value: number;
};

export type URLSearchQuery = ConstructorParameters<typeof URLSearchParams>[0];

export type StorageGetRequest = { id: string; encoding?: string } & Record<
    string,
    string
>;

export type OwnerToIdentityRequest = { owner: string } & Record<string, string>;

export type IdentityToOwnerRequest = { identity: string } & Record<
    string,
    string
>;

export type EncryptDataRequest = { publicKey: string; data: string } & Record<
    string,
    string
>;

export type DecryptDataRequest = { data: string } & Record<string, string>;

export type PublicKeyByIdentityRequest = { identity: string } & Record<
    string,
    string
>;

export type StoragePutStringRequest = {
    id: string;
    encoding?: string;
} & Record<string, string>;

export type SubscriptionOptions = Record<string, unknown>;

export type SubscriptionParams = {
    contract: string;
    event: string;
} & SubscriptionOptions;

export type SubscriptionRequest = { type: string; params: SubscriptionParams };

export type SubscriptionEventMetaData = {
    type: string;
    request: SubscriptionRequest;
    subscriptionId: string | null;
};

export type SubscriptionEvent<T> = SubscriptionEventMetaData & { data: T };

export type MessageQueueConfig = {
    type: string;
    params?: SubscriptionParams | Record<string, unknown>;
};

export type SubscriptionMessages = { [subscriptionId: string]: any[] };

export type SubscriptionErrors = { [subscriptionId: string]: Error | null };

export type ZProxyWSOptions = {
    messageQueueSizeLimit?: number;
};

export type ZProxyWS = WebSocket & {
    subscribeToContractEvent: <T>(
        cfg: SubscriptionParams,
    ) => Promise<() => Promise<T>>;
};

export type PointType = {
    version: string;
    status: {
        ping: () => Promise<"pong">;
    };
    contract: {
        load: <T>(request: ContractLoadRequest) => Promise<T>;
        call: <T>(request: ContractCallRequest) => Promise<T>;
        send: <T>(request: ContractSendRequest) => Promise<T>;
        events: <T>(request: ContractEventsRequest) => Promise<T>;
        subscribe: <T>(
            request: SubscriptionParams,
        ) => Promise<() => Promise<T>>;
    };
    storage: {
        postFile: <T>(request: FormData) => Promise<T>;
        encryptAndPostFile: <T>(request: FormData, identities: string[], metadata?: string[]) => Promise<T>;
        getString: <T>(request: StorageGetRequest) => Promise<T>;
        putString: <T>(request: StoragePutStringRequest) => Promise<T>;
    };
    wallet: {
        address: () => Promise<string>;
        hash: () => Promise<string>;
        publicKey: () => Promise<string>;
        balance: (network?: string) => Promise<number>;
        send: <T>(request: WalletSendRequest) => Promise<T>;
        encryptData: <T>(request: EncryptDataRequest) => Promise<T>;
        decryptData: <T>(request: DecryptDataRequest) => Promise<T>;
        decryptSymmetricKey: <T>(request: DecryptDataRequest) => Promise<T>;
        decryptDataWithDecryptedKey: <T>(request: DecryptDataRequest) => Promise<T>;
    };
    identity: {
        ownerToIdentity: <T>(request: OwnerToIdentityRequest) => Promise<T>;
        identityToOwner: <T>(request: IdentityToOwnerRequest) => Promise<T>;
        publicKeyByIdentity: <T>(
            request: PublicKeyByIdentityRequest,
        ) => Promise<T>;
    };
};
