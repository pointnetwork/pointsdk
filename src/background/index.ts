import browser from "webextension-polyfill";
import {
    rpcListener,
    confirmationWindowListener,
} from "pointsdk/background/messaging";

browser.storage.local.get("chainIdGlobal").then((res) => {
    if (!res.chainIdGlobal) {
        browser.storage.local
            .set({
                chainIdGlobal: "ynet",
            })
            .catch((e) => {
                console.error("Failed to set default chain id to storage ", e);
            });
    }
});

browser.runtime.onMessage.addListener(async (message, sender) => {
    if (sender.url?.match("confirmation-window")) {
        return confirmationWindowListener(message);
    } else if (message.__message_type === "rpc") {
        return rpcListener(message);
    } else {
        console.error(
            "Unexpected runtime message: ",
            message,
            " from sender: ",
            sender,
        );
    }
});
