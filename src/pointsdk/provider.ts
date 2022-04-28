const getProvider = () => {
    function handleRequest(request: Record<string, any>) {
        return new Promise((resolve, reject) => {
            const id = Math.random();

            const handler = (e: MessageEvent) => {
                if (
                    e.data.__page_req_id === id &&
                    e.data.__direction === "to_page"
                ) {
                    window.removeEventListener("message", handler);
                    if (e.data.code) {
                        reject({
                            code: e.data.code,
                            message: e.data.message,
                        });
                    } else {
                        resolve(e.data.result);
                    }
                }
            };

            window.addEventListener("message", handler);

            window.postMessage({
                ...request,
                __message_type: "rpc",
                __page_req_id: id,
                __direction: "to_bg",
            });
        });
    }

    return {
        request: handleRequest,
        send: (method: string) => handleRequest({ method }),
    };
};

export default getProvider;
