import React, {useMemo, useState, ChangeEvent} from 'react';
import {useLocation} from 'react-router-dom';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import EventList from './components/EventList';
import {SubscriptionMessage, SUBSCRIPTION_MESSAGE_TYPE, SubscriptionMessageMethod} from '../types';

const Subscriptions = () => {
    const theme = useTheme();
    const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
    const {search} = useLocation();
    const query = useMemo(() => new URLSearchParams(search), [search]);

    const events = useMemo(() => {
        try {
            return JSON.parse(query.get('events') ?? '[]') as string[];
        } catch {
            return [];
        }
    }, [query]);

    const handleClose = () => {
        const msg: SubscriptionMessage = {
            __message_type: SUBSCRIPTION_MESSAGE_TYPE,
            method: SubscriptionMessageMethod.WINDOW_CLOSE
        };
        void browser.runtime.sendMessage(msg);
    };

    const handleSubscribe = () => {
        const msg: SubscriptionMessage = {
            __message_type: SUBSCRIPTION_MESSAGE_TYPE,
            method: SubscriptionMessageMethod.EVENTS_SUBSCRIBE,
            payload: selectedEvents
        };
        void browser.runtime.sendMessage(msg);
    };

    const handleDoNotShow = () => {
        const msg: SubscriptionMessage = {
            __message_type: SUBSCRIPTION_MESSAGE_TYPE,
            method: SubscriptionMessageMethod.WINDOW_NOT_AGAIN
        };
        void browser.runtime.sendMessage(msg);
    };

    const handleShowLater = () => {
        const msg: SubscriptionMessage = {
            __message_type: SUBSCRIPTION_MESSAGE_TYPE,
            method: SubscriptionMessageMethod.WINDOW_LATER
        };
        void browser.runtime.sendMessage(msg);
    };

    const handleSelectOne = (ev: ChangeEvent<HTMLInputElement>) => {
        if (ev.target.checked) {
            setSelectedEvents(prev => [...prev, ev.target.name]);
        } else {
            setSelectedEvents(prev => prev.filter(i => i !== ev.target.name));
        }
    };

    const handleSelectAll = (events: string[]) => {
        setSelectedEvents(events);
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            p={2}
            justifyContent="center"
            alignItems="center"
            height="100vh"
        >
            <Typography
                variant="h4"
                fontWeight="bold"
                color={theme.palette.primary.main}
                mb={3}
                textAlign="center"
            >
                {query.get('host')}
            </Typography>
            <Typography variant="body1" mb={2} textAlign="center">
                Would you like to receive notifications from {query.get('host')}?
            </Typography>
            <Typography variant="body1" mb={2} textAlign="center">
                Choose the events you&apos;d like to subscribe to:
            </Typography>

            <EventList
                events={events}
                selected={selectedEvents}
                onSelectOne={handleSelectOne}
                onSelectAll={handleSelectAll}
            />

            <Box display="flex" gap={1} mt={6}>
                <Button
                    variant="contained"
                    onClick={handleSubscribe}
                    disabled={selectedEvents.length === 0}
                >
                    Subscribe
                </Button>
                <Button variant="outlined" onClick={handleClose}>
                    Close
                </Button>
            </Box>

            <Box mt={3} display="flex" flexDirection="column" alignItems="center">
                <Button variant="text" onClick={handleShowLater}>
                    Remind me later
                </Button>
                <Button variant="text" onClick={handleDoNotShow}>
                    Don&apos;t show again for {query.get('host')}
                </Button>
            </Box>
        </Box>
    );
};

export default Subscriptions;
