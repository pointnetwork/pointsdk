import React, { Fragment, FunctionComponent, useContext } from "react";
import UIThemeProvider from "pointsdk/shared/UIThemeProvider";
import Box from "@mui/material/Box";
import PointLogo from "pointsdk/assets/icons/point.png";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import { BlockchainContext } from "pointsdk/popup/context/blockchain";
import NetworkSwitcher from "pointsdk/popup/components/NetworkSwitcher";
import UserData from "pointsdk/popup/components/UserData";
import Links from "pointsdk/popup/components/Links";
import Balance from "pointsdk/popup/components/Balance";

const Layout: FunctionComponent = () => {
    const { loading } = useContext(BlockchainContext);

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
                    <NetworkSwitcher />
                    <Divider />
                    <UserData />
                    <Divider />
                    <Balance />
                    <Divider />
                    <Links />
                </Fragment>
            )}
        </UIThemeProvider>
    );
};

export default Layout;
