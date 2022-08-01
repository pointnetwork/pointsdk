import React, { ReactEventHandler, useMemo } from "react";
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
import useConfirmationWindow from "./hook";
import { useLocation } from "react-router-dom";
import browser from "webextension-polyfill";

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
    const rawParams: Record<string, string> = useMemo(
        () => JSON.parse(decodeURIComponent(query.get("params") as string)),
        [query],
    );
    const { params, loading } = useConfirmationWindow(
        rawParams,
        query.get("network") as string,
    );

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
            <Box
                display="flex"
                flexDirection="column"
                bgcolor="white"
                height="95vh"
                overflow="hidden"
                m={1.5}
                borderRadius={3}
            >
                <Typography
                    px={2}
                    pb={1}
                    pt={2}
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
                    mx={2}
                    flex={1}
                    sx={{ overflowY: "scroll" }}
                    p="0.8rem"
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
                                    index ===
                                        Object.entries(rawParams).length - 1
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
                <Box
                    px={2}
                    py={1.5}
                    display="flex"
                    justifyContent="flex-end"
                    gap={1}
                >
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
