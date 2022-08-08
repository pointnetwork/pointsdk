import React, { ReactEventHandler, useMemo } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import useTheme from "@mui/material/styles/useTheme";
import useConfirmationWindow from "./hook";
import { useLocation } from "react-router-dom";
import browser from "webextension-polyfill";
import { DecodedTxInput } from "../pointsdk/index.d";

const ConfirmationWindow = () => {
    const theme = useTheme();
    const { search } = useLocation();
    const query = useMemo(() => new URLSearchParams(search), [search]);

    const rawParams: Record<string, string> = useMemo(
        () => JSON.parse(decodeURIComponent(query.get("params") as string)),
        [query],
    );

    const decodedTxData = useMemo((): DecodedTxInput | null => {
        try {
            const str = query.get("decodedTxData");
            return str ? (JSON.parse(str) as DecodedTxInput) : null;
        } catch {
            return null;
        }
    }, [query]);

    const { params, loading } = useConfirmationWindow(
        rawParams,
        query.get("network") as string,
        decodedTxData,
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
                bgcolor={theme.palette.primary.light}
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
                                index === Object.entries(rawParams).length - 1
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
    );
};

export default ConfirmationWindow;
