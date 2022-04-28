import React, { useContext } from "react";
import { Wallet } from "pointsdk/popup/components/wallet";
import { AppContext } from "pointsdk/popup/context";
import {
    WALLET,
    DRIVE,
    EMAIL,
    MESSENGER,
    TERMINAL,
    NOTIFICATION,
} from "pointsdk/utils/constants";

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
