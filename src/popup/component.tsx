import React from "react";
import { browser } from "webextension-polyfill-ts";
import { Toolbar } from "pointsdk/components/toolbar";
import { Navigation } from "pointsdk/components/navigation";
import { Apps } from "pointsdk/components/apps";
import { AppProvider } from "pointsdk/context";
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
