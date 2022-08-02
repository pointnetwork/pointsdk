const TOKENS = {
    default: [],
    rinkeby: [
        {
            name: "USDC",
            address: "0x87284d4150b0FADe12255A7d208AD46526C519ee",
        },
        {
            name: "USDT",
            address: "0xd92e713d051c37ebb2561803a3b5fbabc4962431",
        },
        {
            name: "DAI",
            address: "0x95b58a6Bff3D14B7DB2f5cb5F0Ad413DC2940658",
        },
    ],
} as const;

export default TOKENS;
