import React from "react";
import { browser } from "webextension-polyfill-ts";
import { Toolbar } from "pointsdk/popup/components/toolbar";
import { Navigation } from "pointsdk/popup/components/navigation";
import { Apps } from "pointsdk/popup/components/apps";
import { AppProvider } from "pointsdk/popup/context";
import "./style.scss";

export const Popup: React.FC = () => {
    // Sends the `popupMounted` event
    React.useEffect(() => {
        browser.runtime.sendMessage({ popupMounted: true });
    }, []);
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
