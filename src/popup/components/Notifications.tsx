import React, {FunctionComponent} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import {useNotifications} from '../context/notifications';
import BackArrow from './BackArrow';
import Notification from './Notification';

const Notifications: FunctionComponent = () => {
    const {notifications, loading, error, markRead, dismissError} = useNotifications();

    return (
        <Box sx={{width: 370}}>
            <Box display="flex" alignItems="center">
                <BackArrow to="/" />
                <Typography ml="4px" mt="-3px" variant="h6">
                    Notifications{' '}
                    {notifications.length > 0 ? <sup>({notifications.length})</sup> : ''}
                </Typography>
            </Box>

            {loading || error ? (
                <Box display="flex" alignItems="center" justifyContent="center" my={4}>
                    {loading ? <CircularProgress size={48} /> : null}
                    {error ? (
                        <Alert severity="error" onClose={dismissError}>
                            {error}
                        </Alert>
                    ) : null}
                </Box>
            ) : null}

            {!loading && !error && notifications.length === 0 ? (
                <Typography my={4} textAlign="center" variant="body2">
                    You have no notifications.
                </Typography>
            ) : null}

            {notifications.map(n => (
                <Notification key={n.id} n={n} onMarkRead={markRead} />
            ))}
        </Box>
    );
};

export default Notifications;
