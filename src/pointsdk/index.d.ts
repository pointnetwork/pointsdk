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
    filter?: Record<string, unknown>;
};

export type ContractSendRequest = {
    contract: string;
    method: string;
    params?: unknown[];
    value: string;
    meta?: Record<string, string>;
};

export type WalletSendRequest = {
    to: string;
    network?: string;
    value: number;
};

export type URLSearchQuery = ConstructorParameters<typeof URLSearchParams>[0];

export type StorageGetRequest = {id: string; encoding?: string} & Record<string, string>;

export type OwnerToIdentityRequest = {owner: string} & Record<string, string>;

export type IdentityToOwnerRequest = {identity: string} & Record<string, string>;

export type EncryptDataRequest = {publicKey: string; data: string} & Record<string, string>;

export type DecryptDataRequest = {data: string} & Record<string, string>;

export type PublicKeyByIdentityRequest = {identity: string} & Record<string, string>;

export type StoragePutStringRequest = {
    id: string;
    encoding?: string;
} & Record<string, string>;

export type StoragePubsubPublishRequest = {
    topic: string;
    data: string;
};

export type StoragePubsubPublishForIdentityRequest = {
    identity: string;
    data: any;
    options: Record<string, any>;
};

export type HostStorageSetRequest = {
    path: Array<string|number>;
    value: any;
}

export type HostStorageGetRequest = {
    path: Array<string|number>;
}

export type HostStorageLenRequest = {
    path: Array<string|number>;
}

export type HostStorageDirRequest = {
    path: Array<string|number>;
}

export type HostStorageAppendRequest = {
    path: Array<string|number>;
    value: any;
}

export type HostStorageUnsetRequest = {
    path: Array<string|number>;
}

export type HostStorageRemoveAtRequest = {
    path: Array<string|number>;
    index: number;
}

export type HostStorageReplaceAtRequest = {
    path: Array<string|number>;
    index: number;
    value: any;
}

export type HostStorageInsertAtRequest = {
    path: Array<string|number>;
    index: number;
    value: any;
}

export type SubscriptionOptions = Record<string, unknown>;

export type SubscriptionParams = {
    contract: string;
    event: string;
} & SubscriptionOptions;

export type SubscriptionRequest = {type: string; params: SubscriptionParams};

export type SubscriptionEventMetaData = {
    type: string;
    request: SubscriptionRequest;
    subscriptionId: string | null;
};

export type SubscriptionEvent<T> = SubscriptionEventMetaData & {data: T};

export type MessageQueueConfig = {
    type: string;
    params?: SubscriptionParams | Record<string, unknown>;
};

export type SubscriptionMessages = {[subscriptionId: string]: any[]};

export type SubscriptionErrors = {[subscriptionId: string]: Error | null};

export type ZProxyWSOptions = {
    messageQueueSizeLimit?: number;
};

export type ZProxyWS = WebSocket & {
    subscribeToContractEvent: <T>(cfg: SubscriptionParams) => Promise<() => Promise<T>>;
};

export type IdentityData = {
    identityRegistred: boolean;
    identity: string;
    address: string;
    publicKey: string;
    network: 'solana' | 'ethereum' | 'point';
};

export type PointType = {
    version: string;
    status: {
        ping: () => Promise<'pong'>;
    };
    contract: {
        load: <T>(request: ContractLoadRequest) => Promise<T>;
        call: <T>(request: ContractCallRequest) => Promise<T>;
        send: <T>(request: ContractSendRequest) => Promise<T>;
        events: <T>(request: ContractEventsRequest) => Promise<T>;
        subscribe: <T>(request: SubscriptionParams) => Promise<() => Promise<T>>;
    };
    storage: {
        postFile: <T>(request: FormData) => Promise<T>;
        encryptAndPostFile: <T>(
            request: FormData,
            identities: string[],
            metadata?: string[]
        ) => Promise<T>;
        getString: <T>(request: StorageGetRequest) => Promise<T>;
        getFile: (config: {id: string}) => Promise<Blob>;
        getEncryptedFile: (config: {
            id: string;
            eSymmetricObj?: string;
            symmetricObj?: string;
        }) => Promise<Blob>;
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
        publicKeyByIdentity: <T>(request: PublicKeyByIdentityRequest) => Promise<T>;
        me: () => Promise<IdentityData>;
    };
};

export enum ParamMetaType {
    STORAGE_ID = 'storage_id',
    ZERO_CONTENT = 'zero_content',
    TX_HASH = 'tx_hash',
    NOT_FOUND = 'not_found',
    IDENTITIES = 'identities'
}

type IdentityMeta = {
    handle: string;
    address: string;
};

export type Param = {
    name: string;
    value: string;
    type: string;
    meta?: {
        type: ParamMetaType;
        identities?: IdentityMeta[];
    };
};

export type DecodedTxInput = {
    name: string;
    params: Param[];
    gas: {
        value: string;
        currency: string;
    };
};

export type Token = {
    name: string;
    address: string;
};

export type Network = {
    type: string;
    name: string;
    currency_name: string;
    currency_code: string;
    tokens?: Token[];
};
