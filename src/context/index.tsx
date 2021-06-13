import React, { createContext, useReducer } from "react";
import { ManageViewReducer, WalletReducer } from "./reducers";
import { ManageViewActions } from "@src/types/manageView";
import { WalletActions } from "@src/types/wallet";

type WalletType = {
    address: string;
    funds: number;
    fundsUsd: number;
};

type InitialStateType = {
    wallet: WalletType;
    currentView: string;
};

const initialState = {
    wallet: {
        address: "0x45f7...98J7",
        funds: 0.57,
        fundsUsd: 10.0,
    },
    currentView: "wallet",
};

const AppContext = createContext<{
    state: InitialStateType;
    dispatch: React.Dispatch<any>;
}>({
    state: initialState,
    dispatch: () => null,
});

const mainReducer = (
    { wallet, currentView }: InitialStateType,
    action: ManageViewActions | WalletActions,
) => ({
    wallet: WalletReducer(wallet, action as WalletActions),
    currentView: ManageViewReducer(currentView, action as ManageViewActions),
});

// eslint-disable-next-line react/prop-types
const AppProvider: React.FC = ({ children }) => {
    const [state, dispatch] = useReducer(mainReducer, initialState);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};

export { AppContext, AppProvider };
