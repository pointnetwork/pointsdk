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

interface PubKey {
    readonly type: string;
    readonly value: string;
}

export interface SignDoc {
    /**
     * body_bytes is protobuf serialization of a TxBody that matches the
     * representation in TxRaw.
     */
    bodyBytes: Uint8Array;
    /**
     * auth_info_bytes is a protobuf serialization of an AuthInfo that matches the
     * representation in TxRaw.
     */
    authInfoBytes: Uint8Array;
    /**
     * chain_id is the unique identifier of the chain this transaction targets.
     * It prevents signed transactions from being used on another chain by an
     * attacker
     */
    chainId: string;
    /** account_number is the account number of the account in state */
    accountNumber: unknown; // should be `Long` from the `long` package instead of `unknown`.
}

interface DirectSignDoc {
    bodyBytes?: Uint8Array | null;
    authInfoBytes?: Uint8Array | null;
    chainId?: string | null;
    // Instead of `unknown`, should be `Long` from the `long` package.
    accountNumber?: unknown | null;
}

interface KeplrSignOptions {
    readonly preferNoSetFee?: boolean;
    readonly preferNoSetMemo?: boolean;
    readonly disableBalanceCheck?: boolean;
}

interface StdSignature {
    readonly pub_key: PubKey;
    readonly signature: string;
}

interface DirectSignResponse {
    /**
     * The sign doc that was signed.
     * This may be different from the input signDoc when the signer modifies it as part of the signing process.
     */
    readonly signed: SignDoc;
    readonly signature: StdSignature;
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

                signDirect: async (
                    chainId: string,
                    signer: string,
                    signDoc: DirectSignDoc,
                    signOptions: KeplrSignOptions
                ): Promise<DirectSignResponse> =>
                    (await keplrInstance.signDirect(
                        chainId,
                        signer,
                        signDoc,
                        signOptions
                    )) as DirectSignResponse,

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
        signDirect: async function (
            chainId: string,
            signer: string,
            signDoc: DirectSignDoc,
            signOptions: KeplrSignOptions
        ) {
            return handleRequest({
                method: 'keplr_signDirect',
                params: [chainId, signer, signDoc, signOptions]
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
      sendBack(result)
      signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature>;
      verifyArbitrary(chainId: string, signer: string, data: string | Uint8Array, signature: StdSignature): Promise<boolean>;
      signEthereum(chainId: string, signer: string, // Bech32 address, not hex data: string | Uint8Array, type: 'message' | 'transaction'
*/
