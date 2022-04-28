import React from "react";
import { Toolbar } from "pointsdk/popup/components/toolbar";
import { Navigation } from "pointsdk/popup/components/navigation";
import { Apps } from "pointsdk/popup/components/apps";
import { AppProvider } from "pointsdk/popup/context";

export const Popup: React.FC = () => {
    return (
        <AppProvider>
            <div className="popup_container">
                <Navigation />
                <Toolbar />
                <Apps />
            </div>
        </AppProvider>
    );
};
