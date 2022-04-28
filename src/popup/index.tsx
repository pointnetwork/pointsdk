import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";

void browser.tabs.query({ active: true, currentWindow: true }).then(() => {
    ReactDOM.render(<App />, document.getElementById("popup"));
});
