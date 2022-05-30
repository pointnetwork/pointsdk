import React, { FunctionComponent } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";

const Balance: FunctionComponent = () => {
    const userData = { balance: 0 }; // TODO

    return (
        <Box p={1} mb={1}>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Available Balance
            </Typography>
            <Box display="flex" alignItems="baseline" my={1}>
                <Typography variant="h4" mr={1}>
                    {userData.balance}
                </Typography>
                <Typography>POINT</Typography>
            </Box>
            <Button size="small" variant="contained" endIcon={<SendIcon />}>
                Send Money
            </Button>
        </Box>
    );
};

export default Balance;
