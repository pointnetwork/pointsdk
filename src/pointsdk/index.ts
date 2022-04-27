import browser from "webextension-polyfill";
import getSdk from "pointsdk/pointsdk/sdk";
import getProvider from "pointsdk/pointsdk/provider";

const version = browser.runtime.getManifest().version;
try {
    window.wrappedJSObject.eval(
        `window.point = (${getSdk.toString()})(window.location.origin, "${version}");`,
    );
} catch (e) {
    console.error("Failed to inject point sdk: ", e);
}

try {
    window.wrappedJSObject.eval(
        `window.ethereum = (${getProvider.toString()})(window.location.origin);`,
    );
} catch (e) {
    console.error("Failed to inject window.ethereum: ", e);
}
