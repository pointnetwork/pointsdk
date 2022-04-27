import React from "react";
import { Toolbar } from "pointsdk/popup/components/toolbar";
import { Navigation } from "pointsdk/popup/components/navigation";
import { AppProvider } from "pointsdk/popup/context";
import { NetworkSwitcher } from "pointsdk/popup/components/networkSwitcher";

export const Popup: React.FC = () => (
    <AppProvider>
        <div className="popup_container">
            <Navigation />
            <Toolbar />
            <NetworkSwitcher />
        </div>
    </AppProvider>
);
