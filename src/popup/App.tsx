import browser from "webextension-polyfill";
import React, { Fragment, useEffect, useState } from "react";
// MUI components
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
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
    const [userData, setUserData] = useState<{
        address: string;
        balance: number;
        identity: string;
    }>({
        address: "",
        balance: 0,
        identity: "",
    });

    const getCurrentChainIds = async () => {
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
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await getCurrentChainIds();
            let res = await window.point.wallet.address();
            const address = res.data.address;
            res = await window.point.identity.ownerToIdentity({
                owner: address,
            });
            const identity = res.data.identity;
            res = await window.point.wallet.balance();
            const balance = Number(
                Number(res.data.balance) / 1000000000000000000,
            ).toFixed(8);
            setUserData({ address, balance, identity });
            setLoading(false);
        };
        void init();
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
            {loading ? (
                <Box display="flex" px={12} py={20}>
                    <CircularProgress size={24} />
                    <Typography ml={1}>Loading...</Typography>
                </Box>
            ) : (
                <Fragment>
                    <Box p={1}>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            Global Chain ID:
                        </Typography>
                        <Select
                            sx={{ mt: "2px", mb: 2 }}
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
                                <Box display="flex">
                                    <Typography
                                        variant="caption"
                                        sx={{ opacity: 0.7 }}
                                    >
                                        Chain ID for:
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        fontWeight="bold"
                                        ml="3px"
                                    >
                                        https://{host}
                                    </Typography>
                                </Box>
                                <Select
                                    sx={{ mt: "2px", mb: 2 }}
                                    size="small"
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
                                <Typography fontWeight="bold">
                                    @{userData.identity}
                                </Typography>
                                <Typography
                                    fontFamily="monospace"
                                    variant="caption"
                                >
                                    {userData.address}
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
                                {userData.balance}
                            </Typography>
                            <Typography>POINT</Typography>
                        </Box>
                        <Button
                            size="small"
                            variant="contained"
                            endIcon={<SendIcon />}
                        >
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
                </Fragment>
            )}
        </UIThemeProvider>
    );
};
export default App;
