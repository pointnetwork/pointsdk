import React, {FunctionComponent} from 'react';
import browser from 'webextension-polyfill';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import {PointNotification} from 'pointsdk/pointsdk/index.d';

type ParsedNotification = {
    title: string;
    from: string;
    date: string;
    link: string;
};

const socialActionToTile: Record<string, (id: string | number) => string> = {
    POST_LIKE: (id: string | number) => `Post #${id} got a new like`,
    POST_LIKE_DELETE: (id: string | number) => `Post #${id} got an unlike`,
    POST_DISLIKE: (id: string | number) => `Post #${id} got a new dislike`,
    POST_CREATE: (id: string | number) => `New post #${id}`,
    POST_EDIT: (id: string | number) => `Post #${id} has been edited`,
    POST_DELETE: (id: string | number) => `Post #${id} has been deleted`,
    POST_FLAG: (id: string | number) => `Post #${id} has been flagged`,
    POST_COMMENT_CREATE: (id: string | number) => `New comment on post #${id}`,
    POST_COMMENT_DELETE: (id: string | number) => `Comment deleted on post #${id}`,
    COMMENT_EDIT: (id: string | number) => `Comment edited on post #${id}`,
    COMMENT_DELETE: (id: string | number) => `Comment deleted on post #${id}`
};

function parseNotification(n: PointNotification): ParsedNotification {
    const data = n.arguments;
    if (n.identity === 'social.point' && n.event === 'StateChange') {
        return {
            from: n.identity,
            title: socialActionToTile[data.changeAction as string]
                ? socialActionToTile[data.changeAction as string]!(data.id as string)
                : `New ${n.event}`,
            date: new Date(n.timestamp).toLocaleDateString(),
            link: String(data.changeAction).includes('DELETE')
                ? ''
                : `https://social.point/post/${data.id as string}`
        };
    }

    if (n.identity === 'email.point' && n.event === 'RecipientAdded') {
        return {
            from: n.identity,
            title: 'You got email',
            date: new Date(n.timestamp).toLocaleDateString(),
            link: `https://email.point/show?id=${data.id as string}`
        };
    }

    return {
        from: n.identity,
        title: `New ${n.event}`,
        date: new Date(n.timestamp).toLocaleDateString(),
        link: ''
    };
}

type Props = {
    n: PointNotification;
    onMarkRead: (id: number) => void;
};

const Notification: FunctionComponent<Props> = ({n, onMarkRead}: Props) => {
    const {title, from, date, link} = parseNotification(n);

    const go = async (url: string) => {
        // Open new tab with the desired URL.
        await browser.tabs.create({url});
        // Close the extension popup window.
        window.close();
    };

    return (
        <Box
            sx={{
                borderRadius: 4,
                background:
                    'linear-gradient(to bottom, rgba(0, 10, 23, .8) 0%, rgb(0, 10, 23) 100%)',
                color: 'text.secondary',
                padding: 2,
                margin: 2,
                overflowX: 'auto'
            }}
        >
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography fontWeight="bold" variant="h6">
                    {title}
                </Typography>
                <Button
                    size="small"
                    variant="text"
                    color="inherit"
                    onClick={() => onMarkRead(n.id)}
                    title="Dismiss"
                >
                    <CloseIcon />
                </Button>
            </Box>
            <Box>
                <Typography variant="caption">
                    App: <strong>{from}</strong>
                </Typography>
                <Typography variant="caption" ml={2}>
                    On: <strong>{date}</strong>
                </Typography>
            </Box>
            {link ? (
                <Button variant="text" size="small" onClick={() => go(link)}>
                    View
                </Button>
            ) : null}
        </Box>
    );
};

export default Notification;
