import browser from "webextension-polyfill";
import React, { ReactEventHandler } from "react";
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

const data = {
    From: "0x916f8e7566dd63d7c444468cadea37e80f7f8048 (Your account)",
    To: "0x916f8e7566dd63d7c444468cadea37e80f7f8048",
    Value: parseInt("0x1bc16d674ec80000", 16),
    Gas: parseInt("0x76c0", 16),
    "Gas Price": parseInt("0x9184e72a000", 16),
    Data: "0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675",
};

const ConfirmationWindow = () => {
    const handleAllow: ReactEventHandler = async () => {
        await browser.runtime.sendMessage({ data: "Transaction allowed" });
    };

    const handleCancel: ReactEventHandler = async () => {
        await browser.runtime.sendMessage({ data: "Transaction rejected" });
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
                        {window.location.origin}
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
                    <Button variant="contained" onClick={handleCancel}>
                        Allow
                    </Button>
                    <Button variant="outlined" onClick={handleAllow}>
                        Cancel
                    </Button>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default ConfirmationWindow;
