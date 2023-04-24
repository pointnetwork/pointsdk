import React, {FunctionComponent, useContext} from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import {BlockchainContext} from 'pointsdk/popup/context/blockchain';

const Balance: FunctionComponent = () => {
    const {balance, chainId, networks} = useContext(BlockchainContext);

    return (
        <Box p={1} mb={1}>
            <Typography variant="caption" sx={{opacity: 0.7}}>
                Available Balance
            </Typography>
            <Box display="flex" alignItems="baseline" my={1}>
                <Typography variant="h4" mr={1}>
                    {balance}
                </Typography>
                <Typography>{networks[chainId]?.currency_name.toUpperCase()}</Typography>
            </Box>
            <Button size="small" variant="contained" endIcon={<SendIcon />}>
                Send Money
            </Button>
        </Box>
    );
};

export default Balance;
