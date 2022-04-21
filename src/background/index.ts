import browser from "webextension-polyfill";
import confirmationWindowListener from "pointsdk/background/listeners/confirmationWindowListener";
import rpcListener from "pointsdk/background/listeners/rpcListener";

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
