import React, { ReactEventHandler, useEffect, useState } from "react";
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
    const [display, setDisplay] = useState<"none" | "block">("none");

    useEffect(() => {
        const event = "pointsdk:confirm_transaction";
        const listener = () => {
            setDisplay("block");
        };

        window.addEventListener(event, listener);

        setTimeout(() => {
            window.dispatchEvent(new Event(event));
        }, 2000);

        return () => {
            window.removeEventListener(event, listener);
        };
    }, []);

    const handleAllow: ReactEventHandler = () => {
        setDisplay("none");
    };

    const handleCancel: ReactEventHandler = () => {
        setDisplay("none");
    };

    return (
        <ThemeProvider theme={theme}>
            <Box
                display={display}
                height="100vh"
                width="100vw"
                zIndex={99999}
                position="fixed"
                bgcolor="rgba(0,0,0,0.5)"
            >
                <Box
                    px="1.25rem"
                    py="1.75rem"
                    right={0}
                    width="400px"
                    height="100vh"
                    zIndex={999999}
                    position="fixed"
                    bgcolor="white"
                    sx={{ overflowY: "scroll" }}
                >
                    <Typography>
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
                    <Box
                        display="flex"
                        justifyContent="flex-end"
                        gap={1}
                        mb={3}
                    >
                        <Button variant="outlined" onClick={handleAllow}>
                            Allow
                        </Button>
                        <Button variant="contained" onClick={handleCancel}>
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default ConfirmationWindow;
