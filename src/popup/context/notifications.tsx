import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useMemo,
    useCallback,
    ReactNode
} from 'react';
import {PointNotification} from 'pointsdk/pointsdk/index.d';

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
