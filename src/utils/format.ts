import {formatEther} from '@ethersproject/units';
import type {Token} from '../pointsdk/index.d';

/**
 * Formats an amount using `formatEther` and add the currency.
 *
 * To add the currency, it checks if the `toAddress` is a token address (i.e.: USDC, DAI, etc.);
 *     - if it is, it uses that token as currency;
 *     - if it is not, it uses the network token (POINT, ETH, etc.);
 */
export function formatAmount(
    amount: string,
    networkCurrency: string,
    tokens: Token[],
    toAddress: string
): string {
    if (!amount) {
        return '';
    }

    // Check if we are dealing with an ERC20 token.
    const token = tokens.find(t => t.address === toAddress);
    if (toAddress && token) {
        return `${formatEther(amount)} ${token.name.toUpperCase()}`;
    }

    // We are dealing with the network's native token.
    return `${formatEther(amount)} ${networkCurrency.toUpperCase()}`;
}
