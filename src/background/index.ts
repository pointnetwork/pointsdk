import browser from "webextension-polyfill";
import {
    rpcListener,
    confirmationWindowListener,
    registerHandlerListener,
} from "pointsdk/background/messaging";

const setChainIds = async () => {
    const networksRes = await fetch("https://point/v1/api/blockchain/networks");
    const { networks, default_network } = await networksRes.json();
    await browser.storage.local.set({
        networks: JSON.stringify(networks),
        default_network,
    });
    const { chainIdGlobal } = await browser.storage.local.get("chainIdGlobal");
    if (!chainIdGlobal || !(chainIdGlobal in networks)) {
        await browser.storage.local.set({
            chainIdGlobal: default_network,
        });
    }
};

setChainIds().catch((e) => {
    console.error("Failed to fetch networks info from the node: ", e);
});

browser.runtime.onMessage.addListener(async (message, sender) => {
    if (sender.url?.match("confirmation-window")) {
        return confirmationWindowListener(message);
    } else if (message.__message_type === "rpc") {
        return rpcListener(message);
    } else if (message.__message_type === "registerHandler") {
        return registerHandlerListener(message);
    } else {
        console.error(
            "Unexpected runtime message: ",
            message,
            " from sender: ",
            sender,
        );
    }
});
