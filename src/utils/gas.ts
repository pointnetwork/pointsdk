import { BigNumber } from "@ethersproject/bignumber";
import type { Token } from "../pointsdk/index.d";
import {
    GAS_UNITS_NATIVE_TOKEN_TRANSFER,
    GAS_UNITS_ERC20_TOKEN_TRANSFER,
} from "../constants/gas";

/**
 * Estimates the gas that will be used to transfer tokens
 * (ERC20 tokens or "network native tokens").
 */
export async function getTokenTransferGasEstimate(
    tokens: Token[],
    toAddress: string,
): Promise<string> {
    const token = tokens.some((t) => t.address === toAddress);
    const isERC20 = Boolean(toAddress && token);

    const gasUnits = isERC20
        ? GAS_UNITS_ERC20_TOKEN_TRANSFER
        : GAS_UNITS_NATIVE_TOKEN_TRANSFER;

    try {
        // eslint-disable-next-line
        const gasPrice = (await window.ethereum.request({
            id: Date.now(),
            jsonrpc: "2.0",
            method: "eth_gasPrice",
        })) as string;

        return BigNumber.from(gasUnits).mul(gasPrice).toString();
    } catch (err) {
        console.error("Error getting gasPrice from Point Engine:", err);
        return "";
    }
}
