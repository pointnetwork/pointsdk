export type PointType = {
    point: {
        contract: {
            call: () => Promise<boolean>;
            send: () => Promise<boolean>;
        };
        storage: {
            get: () => Promise<boolean>;
        };
        wallet: {
            address: string;
            hash: string;
        };
    };
};
