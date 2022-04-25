import browser from "webextension-polyfill";
import React, { ReactEventHandler, useMemo } from "react";
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
    const data = useMemo(
        () => JSON.parse(decodeURIComponent(query.get("params"))),
        [query],
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
            <Box px="1rem" py="1.25rem" bgcolor="white">
                <Typography
                    sx={{
                        overflowWrap: "break-word",
                        wordWrap: "break-word",
                    }}
                >
                    <Typography variant="h5" fontWeight="bold">
                        {query.get("host")}
                    </Typography>
                    is trying to send a transaction
                </Typography>
                <Box
                    p="0.8rem"
                    my="1rem"
                    bgcolor={blueGrey[50]}
                    borderRadius={2}
                >
                    {Object.entries(data).map(([key, value], index) => (
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
                                {value}
                            </Typography>
                        </Box>
                    ))}
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
