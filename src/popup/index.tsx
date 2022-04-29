import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";
// PointSDK
import getSdk from "pointsdk/pointsdk/sdk";
const version = browser.runtime.getManifest().version;
const point = getSdk("https://point", version);

void browser.tabs.query({ active: true, currentWindow: true }).then(() => {
    window.point = point;
    ReactDOM.render(<App />, document.getElementById("popup"));
});
