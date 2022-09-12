import browser from "webextension-polyfill";
import getSdk from "pointsdk/pointsdk/sdk";
import getEthProvider from "pointsdk/pointsdk/ethProvider";
import getSolanaProvider from "pointsdk/pointsdk/solanaProvider";
import NETWORKS from "pointsdk/constants/networks";

const version = browser.runtime.getManifest().version;
try {
    window.wrappedJSObject.eval(
        `window.point = (${getSdk.toString()})(window.location.origin, "${version}");`,
    );
    window.wrappedJSObject.eval(
        `window.point.networks = ${JSON.stringify(NETWORKS)};`,
    );
} catch (e) {
    console.error("Failed to inject point sdk: ", e);
}

try {
    window.wrappedJSObject.eval(
        `window.ethereum = (${getEthProvider.toString()})();`,
    );
} catch (e) {
    console.error("Failed to inject window.ethereum: ", e);
}

try {
    window.wrappedJSObject.eval(
        `window.solana = (${getSolanaProvider.toString()})();`,
    );
} catch (e) {
    console.error("Failed to inject window.solana: ", e);
}
