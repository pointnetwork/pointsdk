import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import Label from './Label';

type Props = {
    label: string;
    data: string | Record<string, string>;
};

const spanStyles = {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    marginRight: 4,
    overflowWrap: 'break-word',
    wordWrap: 'break-word'
} as const;

const RawData = ({label, data}: Props) => {
    const theme = useTheme();

    return (
        <Box mb={2}>
            <Label>{label}</Label>
            {typeof data !== 'string' ? (
                <Typography
                    variant="body2"
                    color={theme.palette.text.primary}
                    fontFamily="monospace"
                    sx={{
                        overflowWrap: 'break-word',
                        wordWrap: 'break-word'
                    }}
                >
                    {JSON.stringify(data)}
                </Typography>
            ) : (
                data
                    .substring(2) // remove initial '0x' so we can nicely print 8-character blocks
                    .match(/(.{1,8})/g)
                    ?.map((val, idx) => (
                        <span style={{...spanStyles, color: theme.palette.text.primary}} key={idx}>
                            {val}
                        </span>
                    ))
            )}
        </Box>
    );
};

export default RawData;
