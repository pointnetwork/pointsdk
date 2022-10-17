import useNetwork from "./use-network";

export default function useTokens(networkName: string) {
    const { loading, network } = useNetwork(networkName);
    const tokens = network?.tokens ? network.tokens : [];
    return { tokens, loading };
}
