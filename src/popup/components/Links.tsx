import React, { FunctionComponent } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import HomeIcon from "@mui/icons-material/Home";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

const Links: FunctionComponent = () => (
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
            <Box display="flex" alignItems="center" sx={{ cursor: "pointer" }}>
                <AccountBalanceWalletIcon fontSize="small" />
                <Typography variant="body2" ml="2px">
                    My Wallet
                </Typography>
            </Box>
        </Box>
    </Box>
);

export default Links;
