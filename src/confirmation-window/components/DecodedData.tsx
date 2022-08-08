import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import useTheme from "@mui/material/styles/useTheme";
import Label from "./Label";
import { DecodedTxInput } from "../../pointsdk/index.d";

type Props = {
    data: DecodedTxInput;
};

const DecodedData = ({ data }: Props) => {
    const theme = useTheme();

    return (
        <Box mb={2}>
            <Label>Data</Label>

            <Box sx={{ display: "flex", flexDirection: "row" }}>
                <Typography
                    variant="body2"
                    color={theme.palette.text.secondary}
                >
                    Contract Method:
                </Typography>
                <Typography
                    variant="body2"
                    color={theme.palette.primary.main}
                    fontWeight={600}
                    ml={1}
                >
                    {data.name}
                </Typography>
            </Box>

            {data.params && data.params.length > 0 ? (
                <>
                    <Typography
                        variant="body2"
                        color={theme.palette.text.secondary}
                    >
                        Method Params:
                    </Typography>
                    <ul style={{ marginLeft: 32 }}>
                        {data.params.map((p) => (
                            <li key={p.name}>
                                <Typography
                                    variant="body2"
                                    color={theme.palette.text.secondary}
                                    sx={{
                                        overflowWrap: "break-word",
                                        wordWrap: "break-word",
                                    }}
                                >
                                    {p.name}: {p.value}
                                </Typography>
                            </li>
                        ))}
                    </ul>
                </>
            ) : null}
        </Box>
    );
};

export default DecodedData;
