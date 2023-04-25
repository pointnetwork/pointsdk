const getSolanaProvider = () => {
    const handleRequest = (request: Record<string, any>) =>
        new Promise((resolve, reject) => {
            const id = Math.random();

            const handler = (e: MessageEvent) => {
                if (e.data.__page_req_id === id && e.data.__direction === 'to_page') {
                    window.removeEventListener('message', handler);
                    if (e.data.code) {
                        reject({
                            code: e.data.code,
                            message: e.data.message
                        });
                    } else if (e.data.error) {
                        reject({
                            code: e.data.error.code,
                            message: e.data.error.message
                        });
                    } else {
                        resolve(e.data.result);
                    }
                }
            };

            window.addEventListener('message', handler);

            window.postMessage({
                ...request,
                __message_type: 'rpc',
                __provider: 'solana',
                __page_req_id: id,
                __direction: 'to_bg'
            });
        });
    return {
        connect: async () => {
            const res = await handleRequest({method: 'solana_requestAccount'});
            return {publicKey: res.publicKey};
        },
        disconnect: async () => {}, // TODO
        request: handleRequest,
        signAndSendTransaction: (tx: any) =>
            handleRequest({
                method: 'solana_sendTransaction',
                params: [tx.toJSON()]
            })
    };
};

export default getSolanaProvider;
