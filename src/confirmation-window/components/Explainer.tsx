import React, { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { DecodedTxInput } from "../../pointsdk/index.d";
import useCurrency from "../../utils/use-currency";
import useTokens from "../../utils/use-tokens";
import { formatAmount } from "../../utils/format";

type Props = {
    network: string;
    rawParams: Record<string, string>;
    data: DecodedTxInput | null;
    fallback: ReactNode;
};

const Explainer = ({ network, rawParams, data, fallback }: Props) => {
    const { currency, loading } = useCurrency(network);
    const { tokens } = useTokens(network);

    if (!data) {
        return <Box>{fallback}</Box>;
    }

    const formattedAmount = formatAmount(
        rawParams.value || "",
        currency,
        tokens,
        rawParams.to || "",
    );

    const renderOutgoingFunds = () => {
        if (loading) {
            return <CircularProgress size={16} />;
        }
        if (!rawParams.value || !currency) {
            return null;
        }
        return (
            <Typography mb={1} fontWeight="bold">
                It will send {formattedAmount} from your wallet.
            </Typography>
        );
    };

    return (
        <Box>
            <Typography my={1}>
                is trying to send a transaction to the blockchain on your
                behalf.
            </Typography>

            {rawParams?.value ? renderOutgoingFunds() : null}

            {data.name ? (
                <Typography mb={1}>
                    It wants to execute the smart contract method{" "}
                    <strong>{data.name}</strong>
                    {!data.params || data.params.length === 0
                        ? " without any arguments."
                        : " with the arguments that you may find listed below."}
                </Typography>
            ) : null}

            <Typography mb={1}>
                You will have to pay a transaction fee
                {data.gas?.value && data.gas?.currency
                    ? " which is estimated below."
                    : "."}
            </Typography>
        </Box>
    );
};

export default Explainer;
