import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import useTheme from "@mui/material/styles/useTheme";
import Label from "./Label";

type Props = {
    label: string;
    data: string | Record<string, string>;
};

const RawData = ({ label, data }: Props) => {
    const theme = useTheme();

    return (
        <Box mb={2}>
            <Label>{label}</Label>
            <Typography
                variant="body2"
                color={theme.palette.text.secondary}
                sx={{
                    overflowWrap: "break-word",
                    wordWrap: "break-word",
                }}
            >
                {typeof data === "string" ? data : JSON.stringify(data)}
            </Typography>
        </Box>
    );
};

export default RawData;
