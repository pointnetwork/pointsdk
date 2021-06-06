import React, { FunctionComponent } from "react";
import { browser } from "webextension-polyfill-ts";
import "./styles.scss";


export const Popup: FunctionComponent = () => {
    // Sends the `popupMounted` event
    React.useEffect(() => {
        browser.runtime.sendMessage({ popupMounted: true });
    }, []);

    // Renders the component tree
    return (
        <div className="popup-container">
            <h2>Point Network</h2>
        </div>
    );
};
