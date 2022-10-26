/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

export default function getKeplrProvider() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleRequest = (request: Record<string, any>) =>
        new Promise((resolve, reject) => {
            const id = Math.random();
            const handler = (e: MessageEvent) => {
                if (e.data.__page_req_id === id && e.data.__direction === 'to_page') {
                    window.removeEventListener('message', handler);
                    if (e.data.__error) {
                        const {module, code, message} = e.data.__error;
                        return reject({module, code, message});
                    }
                    delete e.data.__page_req_id;
                    delete e.data.__direction;
                    resolve(Object.keys(e.data).length > 0 ? e.data : undefined);
                }
            };

            window.addEventListener('message', handler);

            window.postMessage({
                ...request,
                __message_type: 'rpc',
                __provider: 'keplr',
                __page_req_id: id,
                __direction: 'to_bg'
            });
        });
    return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        enable: async function (chainIds: string | string[]) {
            return handleRequest({
                method: `keplr_enable as string}`,
                params: [chainIds]
            });
        },
        getKey: async function (chainId: string) {
            return handleRequest({
                method: 'keplr_getKey',
                params: [chainId]
            });
        }
    };
}
/* TODO
      signAmino(chainId: string, signer: string, signDoc: StdSignDoc): Promise<AminoSignResponse>
      signDirect(chainId:string, signer:string, signDoc: {
      sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array>;
      sendBack(result)
      signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature>;
      verifyArbitrary(chainId: string, signer: string, data: string | Uint8Array, signature: StdSignature): Promise<boolean>;
      signEthereum(chainId: string, signer: string, // Bech32 address, not hex data: string | Uint8Array, type: 'message' | 'transaction'
*/
