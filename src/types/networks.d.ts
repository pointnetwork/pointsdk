export type Network = {
    type: 'eth' | 'solana';
    name: string;
    currency_name: string;
    currency_code: string;
    tokens?: Token[];
};

export type Token = {
    name: string;
    address: string;
};
