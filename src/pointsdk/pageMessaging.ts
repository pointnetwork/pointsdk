import browser from "webextension-polyfill";

window.addEventListener("message", async (e) => {
    if (["rpc", "registerHandler"].includes(e.data.__message_type)) {
        const { __direction, __page_req_id, ...payload } = e.data;
        try {
            const res = await browser.runtime.sendMessage({
                ...payload,
                __hostname: e.origin,
            });
            window.postMessage({
                ...res,
                __page_req_id,
                __direction: "to_page",
            });
        } catch (err) {
            console.error("Error processing request: ", err);
        }
    }
});
