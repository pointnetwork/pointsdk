import React, {FunctionComponent} from 'react';
import {useNavigate} from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import NotificationsIcon from '@mui/icons-material/Notifications';
import browser from 'webextension-polyfill';

const Links: FunctionComponent = () => {
    const navigate = useNavigate();

    const go = async (url: string) => {
        // Open new tab with the desired URL.
        await browser.tabs.create({url});

        // Close the extension popup window.
        window.close();
    };

    return (
        <Box p={1}>
            <Typography variant="caption" sx={{opacity: 0.7}}>
                Quick Links
            </Typography>
            <Box display="flex" justifyContent="space-between" my={1}>
                <Box
                    display="flex"
                    alignItems="center"
                    mr={2}
                    sx={{cursor: 'pointer'}}
                    onClick={() => go('https://point')}
                >
                    <HomeIcon fontSize="small" />
                    <Typography variant="body2" ml="2px">
                        Point Explorer
                    </Typography>
                </Box>
                <Box
                    display="flex"
                    alignItems="center"
                    sx={{cursor: 'pointer'}}
                    onClick={() => go('https://point/wallet')}
                >
                    <AccountBalanceWalletIcon fontSize="small" />
                    <Typography variant="body2" ml="2px">
                        My Wallet
                    </Typography>
                </Box>
                <Box
                    display="flex"
                    alignItems="center"
                    sx={{cursor: 'pointer'}}
                    onClick={() => navigate('/notifications')}
                >
                    <NotificationsIcon fontSize="small" />
                    <Typography variant="body2" ml="2px">
                        Notifications
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default Links;
