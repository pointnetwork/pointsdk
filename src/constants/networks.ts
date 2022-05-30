const NETWORKS = {
    ynet: {
        name: "Ynet",
        type: "eth",
        currency: "Point",
    },
    rinkeby: {
        name: "Rinkeby",
        type: "eth",
        currency: "Eth",
    },
    solana_devnet: {
        name: "Solana Devnet",
        type: "solana",
        currency: "Sol",
    },
    // solana: {
    //     name: "Solana",
    //     type: "solana",
    // },
} as const;

export default NETWORKS;
