import browser from "webextension-polyfill";

let windowId: number | null = null;
const displayConfirmationWindow = async () => {
    const win = await browser.windows.create({
        type: "detached_panel",
        url: "./confirmation-window/index.html",
        width: 400,
        height: 600,
    });
    windowId = win.id!;
};

browser.runtime.onMessage.addListener(async (message) => {
    console.log(message);
    if (windowId) {
        await browser.windows.remove(windowId);
        windowId = null;
    }
});

// TODO: this is mocked, do it by incominf ws message instead
setTimeout(() => {
    displayConfirmationWindow();
}, 3000);
