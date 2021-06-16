import { PointType } from "@src/types/point";

export const InjectPoint = (): PointType => {
    return (window.point = {
        contract: {
            call: async () => true,
            send: async () => true,
        },
        storage: {
            get: async () => true,
        },
        wallet: {
            address: "0x45f7...78283",
            hash: "&fsbgvcbhnjdchdvcygbhd",
        },
    });
};
InjectPoint();
