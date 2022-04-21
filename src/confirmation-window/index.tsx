import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";

const renderWindow = () => {
    try {
        ReactDOM.render(
            <App />,
            document.getElementById("point-confirmation-window"),
        );
    } catch (e) {
        console.error("Failed to render confirmation window", e);
    }
};

document.addEventListener("DOMContentLoaded", renderWindow);
