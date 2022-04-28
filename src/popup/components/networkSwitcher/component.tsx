import browser from "webextension-polyfill";
import React, { FunctionComponent, useEffect, useState } from "react";
import {
    MenuItem,
    Select,
    SelectChangeEvent,
    ThemeProvider,
    Typography,
    createTheme,
    Box,
} from "@mui/material";

const theme = createTheme({
    typography: {
        fontFamily: "Arial",
    },
});

export const NetworkSwitcher: FunctionComponent = () => {
    const [loading, setLoading] = useState(false);
    const [globalChainId, setGlobalChainId] = useState("");
    const [host, setHost] = useState<string | null>(null);
    const [hostChainId, setHostChainId] = useState("_unset");

    const getCurrentChainIds = async () => {
        setLoading(true);
        try {
            const [globalChainIdRes, tabs] = await Promise.all([
                browser.storage.local.get("chainIdGlobal"),
                browser.tabs.query({ active: true }),
            ]);
            setGlobalChainId(globalChainIdRes.chainIdGlobal ?? "ynet");
            if (tabs[0] && tabs[0].url?.startsWith("https://")) {
                const url = new URL(tabs[0].url);
                setHost(url.host);
                const hostChainIdRes = await browser.storage.local.get(
                    `chainId_${url.host}`,
                );
                if (hostChainIdRes[`chainId_${url.host}`]) {
                    setHostChainId(hostChainIdRes[`chainId_${url.host}`]);
                }
            } else {
                setHost(null);
            }
        } catch (e) {
            console.error("Failed to get chain ids: ", e);
        }
        setLoading(false);
    };

    useEffect(() => {
        getCurrentChainIds();
    }, []);

    const handleGlobalNetworkChange = async (e: SelectChangeEvent) => {
        await browser.storage.local.set({ chainIdGlobal: e.target.value });
        setGlobalChainId(e.target.value);
    };

    const handleHostNetworkChange = async (e: SelectChangeEvent) => {
        if (!host) return;
        if (e.target.value === "_unset") {
            await browser.storage.local.remove(`chainId_${host}`);
        } else {
            await browser.storage.local.set({
                [`chainId_${host}`]: e.target.value,
            });
        }

        setHostChainId(e.target.value);
    };

    return (
        <ThemeProvider theme={theme}>
            <Box padding="20px">
                <Typography fontWeight="bold">Global Chain ID:</Typography>
                <Select
                    fullWidth
                    value={globalChainId}
                    onChange={handleGlobalNetworkChange}
                    disabled={!globalChainId || loading}
                >
                    <MenuItem value="ynet">Ynet</MenuItem>
                    <MenuItem value="rinkeby">Rinkeby</MenuItem>
                </Select>
                {host && (
                    <>
                        <Typography fontWeight="bold" marginTop="20px">
                            {host} Chain ID:
                        </Typography>
                        <Select
                            fullWidth
                            value={hostChainId}
                            onChange={handleHostNetworkChange}
                            disabled={!host || loading}
                        >
                            <MenuItem value="_unset">Not Set</MenuItem>
                            <MenuItem value="ynet">Ynet</MenuItem>
                            <MenuItem value="rinkeby">Rinkeby</MenuItem>
                        </Select>
                    </>
                )}
            </Box>
        </ThemeProvider>
    );
};
