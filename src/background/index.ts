import browser from "webextension-polyfill";
import {
    rpcListener,
    confirmationWindowListener,
    registerHandlerListener,
    setAuthTokenHandler,
    getAuthToken,
} from "pointsdk/background/messaging";

const setChainIds = async () => {
    try {
        const token = (await getAuthToken()).token;
        const networksRes = await fetch(
            "https://point/v1/api/blockchain/networks",
            {
                headers: {
                    "X-Point-Token": `Bearer ${token}`,
                },
            },
        );
        const { networks, default_network } = await networksRes.json();
        await browser.storage.local.set({
            networks: JSON.stringify(networks),
            default_network,
        });
        const { chainIdGlobal } = await browser.storage.local.get(
            "chainIdGlobal",
        );
        if (!chainIdGlobal || !(chainIdGlobal in networks)) {
            await browser.storage.local.set({
                chainIdGlobal: default_network,
            });
        }
    } catch (e) {
        console.error("Failed to fetch networks info from the node: ", e);
        setTimeout(() => {
            void setChainIds();
        }, 1000);
    }
};

setChainIds();

browser.runtime.onMessage.addListener(async (message, sender) => {
    switch (message.__message_type) {
        case "rpc":
            return rpcListener(message);
        case "registerHandler":
            return registerHandlerListener(message);
        case "setAuthToken":
            if (!sender.url?.match(/^https:\/\/point/)) {
                console.error(
                    "Attempt to set auth token from unauthorized host",
                );
                break;
            }
            return setAuthTokenHandler(message);
        case "getAuthToken":
            return getAuthToken();
        default:
            if (sender.url?.match("confirmation-window")) {
                return confirmationWindowListener(message);
            }
            console.error(
                "Unexpected runtime message: ",
                message,
                " from sender: ",
                sender,
            );
    }
});
