import { WalletType, WalletActions } from "pointsdk/types/wallet";
// import { Types } from "pointsdk/types/shared";

export const WalletReducer = (state: WalletType, action: WalletActions) => {
    switch (action.type) {
        case "UPDATE_VIEW":
            return state;
        default:
            return state;
    }
};
