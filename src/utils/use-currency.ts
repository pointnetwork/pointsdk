import useNetwork from "./use-network";

export default function useCurrency(networkName: string) {
    const { loading, network } = useNetwork(networkName);
    const currency = network?.currency_name ?? "ETH";
    return { currency, loading };
}
