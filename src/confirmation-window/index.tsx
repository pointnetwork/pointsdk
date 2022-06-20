import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";
import getSdk from "pointsdk/pointsdk/sdk";
import getEthProvider from "pointsdk/pointsdk/ethProvider";
import getSolanaProvider from "pointsdk/pointsdk/solanaProvider";
const version = browser.runtime.getManifest().version;
const point = getSdk("https://confirmation-window", version);
const ethereum = getEthProvider();
const solana = getSolanaProvider();

const renderWindow = () => {
    try {
        window.point = point;
        window.ethereum = ethereum;
        window.solana = solana;
        ReactDOM.render(
            <App />,
            document.getElementById("point-confirmation-window"),
        );
    } catch (e) {
        console.error("Failed to render confirmation window", e);
    }
};

document.addEventListener("DOMContentLoaded", renderWindow);
