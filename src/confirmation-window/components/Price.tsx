import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import CircularProgress from '@mui/material/CircularProgress';
import Label from './Label';
import useCurrency from '../../utils/use-currency';
import useTokens from '../../utils/use-tokens';
import {formatAmount} from '../../utils/format';

type Props = {
    label: string;
    value: string;
    network: string;
    to: string;
};

const Price = ({label, value, network, to}: Props) => {
    const theme = useTheme();
    const {currency, loading} = useCurrency(network);
    const {tokens} = useTokens(network);
    const formattedAmount = formatAmount(value, currency, tokens, to);

    return (
        <Box mb={2}>
            <Label>{label}</Label>
            {loading ? (
                <CircularProgress size={16} />
            ) : (
                <Typography fontWeight={600} color={theme.palette.primary.main}>
                    {formattedAmount}
                </Typography>
            )}
        </Box>
    );
};

export default Price;
