import * as React from "react";
import * as ReactDOM from "react-dom";
import { Popup } from "./component";
import "pointsdk/reset.scss";
import "./style.scss";

browser.tabs.query({ active: true, currentWindow: true }).then(() => {
    ReactDOM.render(<Popup />, document.getElementById("popup"));
});
