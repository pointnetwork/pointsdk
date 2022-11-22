import React, {FunctionComponent, useEffect, useState, useCallback} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import {PointNotification} from 'pointsdk/pointsdk/index.d';
import BackArrow from './BackArrow';
import Notification from './Notification';

const Notifications: FunctionComponent = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [notifications, setNotifications] = useState<PointNotification[]>([]);

    useEffect(() => {
        async function fetchUnread() {
            setLoading(true);
            try {
                const {data} = (await window.point.notifications.unread()) as {
                    data: PointNotification[];
                };
                setNotifications(data);
            } catch (err) {
                console.error(err);
                setError('Unable to fetch notifications.');
            } finally {
                setLoading(false);
            }
        }
        void fetchUnread();
    }, []);

    const handleMarkRead = useCallback(async (id: number) => {
        try {
            await window.point.notifications.markRead(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            console.error(err);
            setError('Unable to mark notification as read.');
        }
    }, []);

    const handleCloseError = () => {
        setError('');
    };

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
                        <Alert severity="error" onClose={handleCloseError}>
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
                <Notification key={n.id} n={n} onMarkRead={handleMarkRead} />
            ))}
        </Box>
    );
};

export default Notifications;
