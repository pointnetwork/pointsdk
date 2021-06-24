import { PointType } from "pointsdk/types/point";

export default {
    contract: {
        call: () => console.log('Contract.call'),
        send: () => console.log('Contract.send'),
    },
    storage: {
        get: async () => true,
    },
    wallet: {
        address: "0x45f7...78283",
        hash: "&fsbgvcbhnjdchdvcygbhd",
    },
} as PointType;
