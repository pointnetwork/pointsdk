import React, {FunctionComponent} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import {PointNotification} from 'pointsdk/pointsdk/index.d';

type Props = {
    n: PointNotification;
    onMarkRead: (id: number) => void;
};

const Notification: FunctionComponent<Props> = ({n, onMarkRead}: Props) => {
    const markRead = () => {
        onMarkRead(n.id);
    };

    return (
        <Box
            sx={{
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: 'primary.main',
                borderRadius: 2,
                padding: 2,
                margin: 2,
                overflowX: 'auto'
            }}
        >
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography>
                    {n.event} ({n.contract})
                </Typography>
                <Button size="small" variant="text" color="primary" onClick={markRead}>
                    <CloseIcon />
                </Button>
            </Box>
            <pre>{JSON.stringify(n.arguments, null, 2)}</pre>
        </Box>
    );
};

export default Notification;
