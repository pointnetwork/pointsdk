import browser from "webextension-polyfill";

let windowId: number | null = null;
export const displayConfirmationWindow = async (
    reqId: string,
    pointId: string,
    host: string,
    params = {},
) => {
    const win = await browser.windows.create({
        type: "detached_panel",
        url: `./confirmation-window/index.html?reqId=${reqId}&pointId=${pointId}&host=${host}&params=${encodeURIComponent(
            JSON.stringify(params),
        )}`,
        width: 400,
        height: 600,
    });
    windowId = win.id!;
};

export const closeConfirmationWindow = async () => {
    if (windowId) {
        await browser.windows.remove(windowId);
        windowId = null;
    }
};
