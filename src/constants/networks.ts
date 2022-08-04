const NETWORKS = {
    ynet: {
        name: "Xnet",
        type: "eth",
        currency: "xPoint",
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
