import React from "react";
import { formatEther } from "@ethersproject/units";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import useTheme from "@mui/material/styles/useTheme";
import { DecodedTxInput } from "../../pointsdk/index.d";
import Label from "./Label";

type Props = Pick<DecodedTxInput, "gas">;

const GasEstimate = ({ gas }: Props) => {
    const theme = useTheme();

    const parsedAmount =
        gas.currency.toUpperCase() === "POINT"
            ? formatEther(gas.value)
            : gas.value;

    return (
        <Box mb={2}>
            <Label>Gas (estimate)</Label>
            <Typography fontWeight={600} color={theme.palette.primary.main}>
                {parsedAmount}&nbsp;{gas.currency.toUpperCase()}
            </Typography>
        </Box>
    );
};

export default GasEstimate;
