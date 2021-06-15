import React from "react";
import { browser } from "webextension-polyfill-ts";
import { Toolbar } from "@src/components/toolbar";
import { Navigation } from "@src/components/navigation";
import { Apps } from "@src/components/apps";
import { AppProvider } from "@src/context";
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
