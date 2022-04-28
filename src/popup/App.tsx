import React, { useEffect, useState } from "react";
// MUI components
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import UIThemeProvider from "pointsdk/shared/UIThemeProvider";
// Icons
import PointLogo from "../assets/icons/point.png";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HomeIcon from "@mui/icons-material/Home";
import SendIcon from "@mui/icons-material/Send";

const App: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [globalChainId, setGlobalChainId] = useState<string>("");
    const [host, setHost] = useState<string | null>(null);
    const [hostChainId, setHostChainId] = useState<string>("_unset");

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
        void getCurrentChainIds();
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
        <UIThemeProvider>
            <Box
                display="flex"
                alignItems="center"
                justifyContent="flex-end"
                position="fixed"
                right="0"
            >
                <img src={PointLogo} alt="point-logo" width={20} />
                <Typography ml="2px" mr={2} variant="caption">
                    PointSDK
                </Typography>
            </Box>
            <Box p={1}>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Global Chain ID:
                </Typography>
                <Select
                    sx={{ my: 1 }}
                    size="small"
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
            <Divider />
            <Box p={1}>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Logged in as
                </Typography>
                <Box display="flex" py={1} alignItems="center">
                    <AccountCircleIcon fontSize="large" />
                    <Box mx={1}>
                        <Typography fontWeight="bold">@jatinbumbra</Typography>
                        <Typography fontFamily="monospace" variant="caption">
                            0xeA6671e4E16B35DEe22ec42b155CD00b468cBef0
                        </Typography>
                    </Box>
                </Box>
            </Box>
            <Divider />
            <Box p={1} mb={1}>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Available Balance
                </Typography>
                <Box display="flex" alignItems="baseline" my={1}>
                    <Typography variant="h4" mr={1}>
                        0.988543333
                    </Typography>
                    <Typography>POINT</Typography>
                </Box>
                <Button size="small" variant="contained" endIcon={<SendIcon />}>
                    Send Money
                </Button>
            </Box>
            <Divider />
            <Box p={1}>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Quick Links
                </Typography>
                <Box display="flex" alignItems="baseline" my={1}>
                    <Box
                        display="flex"
                        alignItems="center"
                        mr={2}
                        sx={{ cursor: "pointer" }}
                    >
                        <HomeIcon fontSize="small" />
                        <Typography variant="body2" ml="2px">
                            Point Explorer
                        </Typography>
                    </Box>
                    <Box
                        display="flex"
                        alignItems="center"
                        sx={{ cursor: "pointer" }}
                    >
                        <AccountBalanceWalletIcon fontSize="small" />
                        <Typography variant="body2" ml="2px">
                            My Wallet
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </UIThemeProvider>
    );
};
export default App;
