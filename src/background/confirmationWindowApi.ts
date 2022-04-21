import browser from "webextension-polyfill";

let windowId: number | null = null;
export const displayConfirmationWindow = async () => {
    const win = await browser.windows.create({
        type: "detached_panel",
        url: "./confirmation-window/index.html",
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
