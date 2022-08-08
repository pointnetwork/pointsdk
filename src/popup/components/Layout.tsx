import React, { Fragment, FunctionComponent, useContext } from "react";
import Box from "@mui/material/Box";
import PointLogo from "pointsdk/assets/icons/point.png";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import { BlockchainContext } from "../context/blockchain";
import UIThemeProvider from "./UIThemeProvider";
import NetworkSwitcher from "./NetworkSwitcher";
import UserData from "./UserData";
import Links from "./Links";
import Balance from "./Balance";
import Version from "./Version";
import Tokens from "pointsdk/popup/components/Tokens";

const Layout: FunctionComponent = () => {
    const { loading } = useContext(BlockchainContext);

    return (
        <UIThemeProvider>
            <Box sx={{ minWidth: 370 }}>
                {" "}
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="flex-end"
                    position="fixed"
                    right="0"
                >
                    <img src={PointLogo} alt="point-logo" width={20} />
                    <Typography ml="2px" mr={2} variant="caption">
                        PointSDK <Version />
                    </Typography>
                </Box>
                {loading ? (
                    <Box
                        display="flex"
                        px={12}
                        py={20}
                        alignItems="center"
                        justifyContent="center"
                    >
                        <CircularProgress size={24} />
                        <Typography ml={1}>Loading...</Typography>
                    </Box>
                ) : (
                    <Fragment>
                        <NetworkSwitcher />
                        <Divider />
                        <UserData />
                        <Divider />
                        <Balance />
                        <Divider />
                        <Links />
                        <Divider />
                        <Tokens />
                    </Fragment>
                )}
            </Box>
        </UIThemeProvider>
    );
};

export default Layout;
