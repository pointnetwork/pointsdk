import {Types, ActionMap} from './shared';

export type WalletType = {
    address: string;
    funds: number;
    fundsUsd: number;
};

export type WalletPayload = {
    [Types.update]: {
        address: string;
        funds: number;
        fundsUsd: number;
    };
};

export type WalletActions = ActionMap<WalletPayload>[keyof ActionMap<WalletPayload>];
