import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useMemo,
    useCallback,
    ReactNode
} from 'react';
import browser from 'webextension-polyfill';
import {PointNotification, BlockRange} from 'pointsdk/pointsdk/index.d';

type NotificationsCtxType = {
    notifications: PointNotification[];
    loading: boolean;
    error: string;
    markRead: (id: number) => void;
    dismissError: () => void;
};

const NotificationsCtx = createContext<NotificationsCtxType>({
    notifications: [],
    loading: false,
    error: '',
    markRead: () => {},
    dismissError: () => {}
});
NotificationsCtx.displayName = 'NotificationsCtx';

export const NotificationsProvider = ({children}: {children: ReactNode}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [notifications, setNotifications] = useState<PointNotification[]>([]);
    const [finishFetching, setFinishFetching] = useState(false);

    useEffect(() => {
        async function fetchPastEvents(opts: Partial<BlockRange> = {}) {
            console.log('Request to fetch past events', opts);
            try {
                const {data} = (await window.point.notifications.scan(opts)) as {
                    data: {from: number; to: number; latest: number; logs: PointNotification[]};
                };
                if (data.logs && data.logs.length > 0) {
                    setNotifications(prev => [...prev, ...data.logs]);
                }
                if (data.latest > data.to) {
                    await fetchPastEvents({from: data.to + 1, latest: data.latest});
                } else {
                    setFinishFetching(true);
                }
            } catch (err) {
                console.error(err);
            }
        }
        // TODO: remove the hardcoded `latest` value to scan up to the actual latest block.
        void fetchPastEvents({latest: 4_053_000});
    }, []);

    useEffect(() => {
        async function fetchUnread() {
            setLoading(true);
            try {
                const {data} = (await window.point.notifications.unread()) as {
                    data: PointNotification[];
                };
                setNotifications(prev => [...prev, ...data]);
            } catch (err) {
                console.error(err);
                setError('Unable to fetch notifications.');
            } finally {
                setLoading(false);
            }
        }
        void fetchUnread();
    }, []);

    useEffect(() => {
        const count = notifications.length;
        if (finishFetching && count > 0) {
            void browser.notifications.create({
                type: 'basic',
                iconUrl: '../../assets/icons/icon-48.png',
                title: 'Point Notifications',
                message: `You have ${count} new notification${count > 1 ? 's' : ''}.`
            });
        }
    }, [notifications, finishFetching]);

    const markRead = useCallback(async (id: number) => {
        try {
            await window.point.notifications.markRead(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            console.error(err);
            setError('Unable to mark notification as read.');
        }
    }, []);

    const dismissError = useCallback(() => {
        setError('');
    }, []);

    const value = useMemo(
        () => ({notifications, loading, error, markRead, dismissError}),
        [notifications, loading, error, markRead, dismissError]
    );

    return <NotificationsCtx.Provider value={value}>{children}</NotificationsCtx.Provider>;
};

export function useNotifications() {
    const ctx = useContext(NotificationsCtx);
    if (!ctx) {
        throw new Error('useNotifications must be used within a <NotificationsProvider>');
    }
    return ctx;
}
