import React, { FunctionComponent } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useBlockchain } from "pointsdk/popup/context/blockchain";

const UserData: FunctionComponent = () => {
    const { userData } = useBlockchain();

    return (
        <Box p={1}>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Logged in as
            </Typography>
            <Box display="flex" py={1} alignItems="center">
                <AccountCircleIcon fontSize="large" />
                <Box mx={1}>
                    <Typography fontWeight="bold">
                        @{userData.identity}
                    </Typography>
                    <Typography fontFamily="monospace" variant="caption">
                        {userData.address}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default UserData;
