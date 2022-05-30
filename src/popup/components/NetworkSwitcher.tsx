import React, { FunctionComponent, useContext } from "react";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import { BlockchainContext } from "pointsdk/popup/context/blockchain";

const NetworkSwitcher: FunctionComponent = () => {
    const {
        globalChainId,
        loading,
        host,
        hostChainId,
        handleHostNetworkChange,
        handleGlobalNetworkChange,
    } = useContext(BlockchainContext);

    return (
        <Box p={1}>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Global Chain ID:
            </Typography>
            <Select
                sx={{ mt: "2px", mb: 2 }}
                size="small"
                fullWidth
                value={globalChainId}
                onChange={handleGlobalNetworkChange}
                disabled={!globalChainId || loading}
            >
                <MenuItem value="ynet">Ynet</MenuItem>
                <MenuItem value="rinkeby">Rinkeby</MenuItem>
            </Select>
            {host && (
                <>
                    <Box display="flex">
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            Chain ID for:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" ml="3px">
                            https://{host}
                        </Typography>
                    </Box>
                    <Select
                        sx={{ mt: "2px", mb: 2 }}
                        size="small"
                        fullWidth
                        value={hostChainId}
                        onChange={handleHostNetworkChange}
                        disabled={!host || loading}
                    >
                        <MenuItem value="_unset">Not Set</MenuItem>
                        <MenuItem value="ynet">Ynet</MenuItem>
                        <MenuItem value="rinkeby">Rinkeby</MenuItem>
                    </Select>
                </>
            )}
        </Box>
    );
};

export default NetworkSwitcher;
