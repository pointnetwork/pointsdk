import browser from "webextension-polyfill";
import React, { ReactEventHandler, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
// Components
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
// Theme
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import createTheme from "@mui/material/styles/createTheme";
import deepPurple from "@mui/material/colors/deepPurple";
import blueGrey from "@mui/material/colors/blueGrey";
import CircularProgress from "@mui/material/CircularProgress";
import { formatEther } from "@ethersproject/units";
import NETWORKS from "pointsdk/constants/networks";
import { BigNumber } from "@ethersproject/bignumber";

const theme = createTheme({
    typography: {
        fontFamily: "Arial",
    },
    palette: {
        primary: {
            main: deepPurple.A200,
            light: blueGrey[50],
        },
    },
});

const ConfirmationWindow = () => {
    const { search } = useLocation();
    const query = useMemo(() => new URLSearchParams(search), [search]);
    const data: Record<string, string> = useMemo(
        () => JSON.parse(decodeURIComponent(query.get("params"))),
        [query],
    );

    const [params, setParams] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const processParams = async () => {
        setLoading(true);
        const processedParams: Record<string, string> = {};
        let userAddress;
        try {
            const { data } = await window.point.wallet.address();
            userAddress = data.address;
        } catch (e) {
            console.error("Failed to fetch user address", e);
        }
        for (const key in data) {
            try {
                switch (key) {
                    case "from":
                    case "to":
                        const res = await window.point.identity.ownerToIdentity(
                            { owner: data[key] },
                        );
                        if (res?.data?.identity) {
                            const isYourIdentity =
                                data[key].toLowerCase() ===
                                userAddress.toLowerCase();
                            processedParams[key] = `${
                                isYourIdentity
                                    ? `<span style="color: #7c4dff; font-weight: bold;">${res.data.identity} (You)</span>`
                                    : res.data.identity
                            } <span style="color: #9e9e9e;">${
                                data[key]
                            }</span>`;
                        } else {
                            processedParams[
                                key
                            ] = `<span style="color: #9e9e9e;">${data[key]}</span>`;
                        }
                        break;
                    case "value":
                    case "gas":
                    case "gasPrice":
                        processedParams[
                            key
                        ] = `<span style="color: #7c4dff; font-weight: bold;">${formatEther(
                            data[key],
                        )}</span> ${
                            NETWORKS[query.get("network")]?.currency ?? "Eth"
                        }`;
                        break;
                    case "data":
                    default:
                        processedParams[key] = `<span style="color: #9e9e9e;">${
                            typeof data[key] === "string"
                                ? data[key]
                                : JSON.stringify(data[key])
                        }</span>`;
                }
            } catch (e) {
                console.error(`Error decoding param ${key}`, e);
                processedParams[key] = data[key];
            }
        }
        if (data.value && data.gasPrice) {
            try {
                processedParams[
                    "Total Price"
                ] = `<span style="color: #ef6c00; font-weight: bold; font-size: 1rem;">${formatEther(
                    BigNumber.from(data.value).add(data.gasPrice).toString(),
                )}</span> ${NETWORKS[query.get("network")]?.currency ?? "Eth"}`;
            } catch (e) {
                console.error("Failed to calculate");
            }
        }

        setParams(processedParams);
        setLoading(false);
    };
    useEffect(() => {
        void processParams();
    }, [data]);

    const handleAllow: ReactEventHandler = async () => {
        await browser.runtime.sendMessage({
            confirm: true,
            reqId: query.get("reqId"),
            pointId: query.get("pointId"),
        });
    };

    const handleCancel: ReactEventHandler = async () => {
        await browser.runtime.sendMessage({
            confirm: false,
            pointId: query.get("pointId"),
        });
    };

    return (
        <ThemeProvider theme={theme}>
            <Box px="1rem" py="1.25rem" bgcolor="white">
                <Typography
                    sx={{
                        overflowWrap: "break-word",
                        wordWrap: "break-word",
                    }}
                >
                    <Typography variant="h5" fontWeight="bold">
                        {query.get("host")?.replace(/^https?:\/\//, "")}
                    </Typography>
                    is trying to send a transaction
                </Typography>
                <Box
                    p="0.8rem"
                    my="1rem"
                    bgcolor={blueGrey[50]}
                    borderRadius={2}
                >
                    {loading ? (
                        <CircularProgress size={24} />
                    ) : (
                        Object.entries(params).map(([key, value], index) => (
                            <Box
                                key={index}
                                my={
                                    !index ||
                                    index === Object.entries(data).length - 1
                                        ? 0
                                        : 1
                                }
                            >
                                <Typography variant="body2" fontWeight="600">
                                    {key}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        overflowWrap: "break-word",
                                        wordWrap: "break-word",
                                    }}
                                >
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: value,
                                        }}
                                    />
                                </Typography>
                            </Box>
                        ))
                    )}
                </Box>
                <Box display="flex" justifyContent="flex-end" gap={1} mb={3}>
                    <Button variant="contained" onClick={handleAllow}>
                        Allow
                    </Button>
                    <Button variant="outlined" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default ConfirmationWindow;
