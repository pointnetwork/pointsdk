import React from "react";
import Typography from "@mui/material/Typography";
import useTheme from "@mui/material/styles/useTheme";
import { Param, ParamMetaType } from "../../pointsdk/index.d";

type Props = { param: Param };

const TxParamValue = ({ param }: Props) => {
    const theme = useTheme();

    switch (param.meta?.type) {
        case ParamMetaType.ZERO_CONTENT:
            return <span>no content</span>;
        case ParamMetaType.STORAGE_ID:
            return (
                <a
                    href={`https://point/_storage/${param.value}`}
                    target="_blank"
                    rel="noreferrer"
                >
                    content in storage &rarr; {param.value}
                </a>
            );
        case ParamMetaType.TX_HASH:
            return (
                <span>Blockchain Transaction Hash &rarr; {param.value}</span>
            );
        case ParamMetaType.NOT_FOUND:
            return (
                <span>
                    {param.value} <em>(not found in storage nor blockchain)</em>
                </span>
            );
        case ParamMetaType.IDENTITIES:
            return (
                <ul style={{ marginLeft: 24 }}>
                    {(param.meta.identities || []).map((identity) => (
                        <li key={identity}>
                            <Typography
                                fontSize="inherit"
                                fontWeight="normal"
                                color={theme.palette.text.primary}
                            >
                                {identity}
                            </Typography>
                        </li>
                    ))}
                </ul>
            );
        default:
            return <span>{param.value}</span>;
    }
};

export default TxParamValue;
