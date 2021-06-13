import { WalletType, WalletActions } from "@src/types/wallet";
// import { Types } from "@src/types/shared";

export const WalletReducer = (state: WalletType, action: WalletActions) => {
    switch (action.type) {
        case "UPDATE_VIEW":
            return state;
        default:
            return state;
    }
};
