import React, { useState, useEffect } from "react";
import { formatEther } from "@ethersproject/units";
import browser from "webextension-polyfill";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import useTheme from "@mui/material/styles/useTheme";
import CircularProgress from "@mui/material/CircularProgress";
import Label from "./Label";

type Props = {
    label: string;
    value: string;
    network: string;
};

const Price = ({ label, value, network }: Props) => {
    const theme = useTheme();
    const [currency, setCurrency] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const networksRes = await browser.storage.local.get("networks");
                const networks = JSON.parse(networksRes.networks);
                setCurrency(networks[network]?.currency_name ?? "ETH");
            } catch (e) {
                console.error("Failed to get networks", e);
            }
            setLoading(false);
        }
        void fetchData();
    }, []);

    return (
        <Box mb={2}>
            <Label>{label}</Label>
            {loading ? (
                <CircularProgress size={16} />
            ) : (
                <Typography fontWeight={600} color={theme.palette.primary.main}>
                    {formatEther(value)}&nbsp;{currency}
                </Typography>
            )}
        </Box>
    );
};

export default Price;
