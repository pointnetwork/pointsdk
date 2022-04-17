import * as React from "react";
import * as ReactDOM from "react-dom";
import ConfirmationWindow from "./ConfirmationWindow";

export default function () {
    try {
        const div = document.createElement("div");
        div.id = "point-confirmation-window";
        div.style.position = "fixed";
        div.style.top = "0px";
        div.style.left = "0px";
        div.style.zIndex = "1040";
        document.body.appendChild(div);

        ReactDOM.render(
            <ConfirmationWindow />,
            document.getElementById("point-confirmation-window"),
        );
    } catch (e) {
        console.error("Failed to render confirmation window", e);
    }
}
