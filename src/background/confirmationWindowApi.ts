import browser from "webextension-polyfill";

let windowId: number | null = null;
export const displayConfirmationWindow = async (
    reqId: string,
    pointId: string,
    host: string,
    network: string,
    params = {},
    decodedTxData = {},
) => {
    const query = new URLSearchParams();
    query.append("reqId", reqId);
    query.append("pointId", pointId);
    query.append("host", host);
    query.append("network", network);
    query.append("params", JSON.stringify(params));
    query.append("decodedTxData", JSON.stringify(decodedTxData));

    const win = await browser.windows.create({
        type: "detached_panel",
        width: 400,
        height: 600,
        url: `./confirmation-window/index.html?${query.toString()}`,
    });
    windowId = win.id!;
};

export const closeConfirmationWindow = async () => {
    if (windowId) {
        await browser.windows.remove(windowId);
        windowId = null;
    }
};
