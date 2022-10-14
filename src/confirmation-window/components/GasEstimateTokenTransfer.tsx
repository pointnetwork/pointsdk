import React, { useState, useEffect } from "react";
import useCurrency from "../../utils/use-currency";
import useTokens from "../../utils/use-tokens";
import { getTokenTransferGasEstimate } from "../../utils/gas";
import GasEstimate from "./GasEstimate";

type Props = {
    network: string;
    toAddress: string;
};

const GasEstimateTokenTransfer = ({ network, toAddress }: Props) => {
    const { currency, loading: loadingCurrency } = useCurrency(network);
    const { tokens, loading: loadingTokens } = useTokens(network);
    const [gas, setGas] = useState("");

    useEffect(() => {
        async function getGas() {
            const resp = await getTokenTransferGasEstimate(tokens, toAddress);
            setGas(resp);
        }

        if (!loadingCurrency && !loadingTokens) {
            void getGas();
        }
    }, [tokens, toAddress, loadingTokens, loadingCurrency]);

    return gas ? <GasEstimate gas={{ value: gas, currency }} /> : null;
};

export default GasEstimateTokenTransfer;
