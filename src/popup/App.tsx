import React from "react";
// MUI components
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import UIThemeProvider from "pointsdk/shared/UIThemeProvider";
// Icons
import PointLogo from "../assets/icons/point.png";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HomeIcon from "@mui/icons-material/Home";
import SendIcon from "@mui/icons-material/Send";

const App: React.FC = () => {
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
                <Typography mx={1} variant="caption">
                    PointSDK
                </Typography>
            </Box>
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
