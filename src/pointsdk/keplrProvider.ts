/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {AccountData, AminoSignResponse, BroadcastMode} from '@cosmjs/launchpad';
import {Coin} from '@cosmjs/amino';

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
export interface AminoMsg {
    readonly type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly value: any;
}

export interface StdFee {
    readonly amount: readonly Coin[];
    readonly gas: string;
    /** The granter address that is used for paying with feegrants */
    readonly granter?: string;
    /** The fee payer address. The payer must have signed the transaction. */
    readonly payer?: string;
}
export interface StdSignDoc {
    readonly chain_id: string;
    readonly account_number: string;
    readonly sequence: string;
    readonly fee: StdFee;
    readonly msgs: readonly AminoMsg[];
    readonly memo: string;
}

export interface KeplrKey {
    bech32Address: string;
    pubKey: Uint8Array;
}

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
    const keplrInstance = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        enable: async function (chainIds: string | string[]) {
            return handleRequest({
                method: `keplr_enable`,
                params: [chainIds]
            });
        },
        getKey: async function (chainId: string) {
            return handleRequest({
                method: 'keplr_getKey',
                params: [chainId]
            });
        },
        getOfflineSigner: function (chainId: string) {
            return {
                getAccounts: async (): Promise<AccountData[]> => {
                    const key = (await keplrInstance.getKey(chainId)) as KeplrKey;
                    return [
                        {
                            address: key.bech32Address,
                            // Currently, only secp256k1 is supported.
                            algo: 'secp256k1',
                            pubkey: key.pubKey
                        }
                    ];
                },

                signAmino: async (
                    signerAddress: string,
                    signDoc: StdSignDoc
                ): Promise<AminoSignResponse> => {
                    if (chainId !== signDoc.chain_id) {
                        throw new Error('Unmatched chain id with the offline signer');
                    }
                    const key = (await keplrInstance.getKey(signDoc.chain_id)) as KeplrKey;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if (key.bech32Address !== signerAddress) {
                        throw new Error('Unknown signer address');
                    }
                    return (await keplrInstance.signAmino(
                        chainId,
                        signerAddress,
                        signDoc
                    )) as AminoSignResponse;
                },

                // Fallback function for the legacy cosmjs implementation before the staragte.
                sign: async (
                    signerAddress: string,
                    signDoc: StdSignDoc
                ): Promise<AminoSignResponse> =>
                    (await keplrInstance.signAmino(
                        chainId,
                        signerAddress,
                        signDoc
                    )) as AminoSignResponse
            };
        },
        signAmino: async function (chainId: string, signerAddress: string, signDoc: StdSignDoc) {
            return handleRequest({
                method: 'keplr_signAmino',
                params: [chainId, signerAddress, signDoc]
            });
        },
        sendTx: async function (chainId: string, tx: Uint8Array, mode: BroadcastMode) {
            return handleRequest({
                method: 'keplr_sendTx',
                params: [chainId, tx, mode]
            });
        }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).getOfflineSigner = keplrInstance.getOfflineSigner.bind(keplrInstance);
    return keplrInstance;
}
/* TODO
      signDirect(chainId:string, signer:string, signDoc: {
      sendBack(result)
      signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature>;
      verifyArbitrary(chainId: string, signer: string, data: string | Uint8Array, signature: StdSignature): Promise<boolean>;
      signEthereum(chainId: string, signer: string, // Bech32 address, not hex data: string | Uint8Array, type: 'message' | 'transaction'
*/
