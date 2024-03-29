import browser from 'webextension-polyfill';

// eslint-disable-next-line @typescript-eslint/no-misused-promises
window.addEventListener('message', async e => {
    if (
        ['rpc', 'registerHandler', 'setAuthToken', 'getAuthToken'].includes(e.data.__message_type)
    ) {
        const {__direction, __page_req_id, ...payload} = e.data;
        try {
            const res = await browser.runtime.sendMessage({
                ...payload,
                __hostname: e.origin
            });
            window.postMessage({
                ...res,
                __page_req_id,
                __direction: 'to_page'
            });
        } catch (err) {
            console.error('Error processing request: ', err);
            window.postMessage({
                code: err.code ?? 500,
                message: err.message,
                __page_req_id,
                __direction: 'to_page'
            });
        }
    }
});
