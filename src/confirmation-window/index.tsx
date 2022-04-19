import * as React from "react";
import * as ReactDOM from "react-dom";
import ConfirmationWindow from "./ConfirmationWindow";

const renderWindow = () => {
    try {
        ReactDOM.render(
            <ConfirmationWindow />,
            document.getElementById("point-confirmation-window"),
        );
    } catch (e) {
        console.error("Failed to render confirmation window", e);
    }
};

document.addEventListener("DOMContentLoaded", renderWindow);
