import React, { useContext } from "react";
import { Wallet } from "@src/components/wallet";
import { AppContext } from "@src/context";
import {
    WALLET,
    DRIVE,
    EMAIL,
    MESSENGER,
    TERMINAL,
    NOTIFICATION,
} from "@src/utils/constants";
import "./style.scss";

export const Apps: React.FC = () => {
    // Sends the `popupMounted` event
    const { state } = useContext(AppContext);
    return (
        <div>
            {state.currentView === WALLET && <Wallet />}
            {state.currentView === DRIVE && <div>Drive</div>}
            {state.currentView === EMAIL && <div>Email</div>}
            {state.currentView === MESSENGER && <div>Messenger</div>}
            {state.currentView === TERMINAL && <div>Terminal</div>}
            {state.currentView === NOTIFICATION && <div>Notification</div>}
        </div>
    );
};
