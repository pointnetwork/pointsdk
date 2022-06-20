const NETWORKS = {
    ynet: {
        name: "Ynet",
        type: "eth",
        currency: "yPoint",
    },
    rinkeby: {
        name: "Rinkeby",
        type: "eth",
        currency: "rinkebyEth",
    },
    solana_devnet: {
        name: "Solana Devnet",
        type: "solana",
        currency: "DevSol",
    },
    // solana: {
    //     name: "Solana",
    //     type: "solana",
    // },
} as const;

export default NETWORKS;
