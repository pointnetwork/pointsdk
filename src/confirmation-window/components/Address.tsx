import React, {useState, useEffect} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import useTheme from '@mui/material/styles/useTheme';
import Label from './Label';

type Props = {
    label: string;
    address: string;
};

const Address = ({label, address}: Props) => {
    const [userAddress, setUserAddress] = useState('');
    const [identity, setIdentity] = useState('');
    const [loading, setLoading] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);

            try {
                const {data} = await window.point.wallet.address();
                setUserAddress(data.address);
            } catch (e) {
                console.error('Failed to fetch user address', e);
            }

            try {
                const {data} = await window.point.identity.ownerToIdentity({owner: address});
                if (data && data.identity) {
                    setIdentity(data.identity);
                }
            } catch (e) {
                console.error(`Failed to get identity for address ${address}`, e);
            }

            setLoading(false);
        }
        void fetchData();
    }, [address]);

    const isUserAddress = address.toLowerCase() === userAddress.toLowerCase();

    return (
        <Box mb={2}>
            <Label>{label}</Label>
            {loading ? (
                <CircularProgress size={16} />
            ) : (
                <>
                    {identity ? (
                        <Typography
                            variant="body2"
                            sx={{
                                overflowWrap: 'break-word',
                                wordWrap: 'break-word'
                            }}
                            fontWeight={isUserAddress ? 600 : 'normal'}
                            color={
                                isUserAddress
                                    ? theme.palette.primary.main
                                    : theme.palette.text.primary
                            }
                        >
                            {identity}&nbsp;{isUserAddress ? '(You)' : ''}
                        </Typography>
                    ) : null}

                    <Typography
                        color={theme.palette.text.secondary}
                        variant="body2"
                        sx={{
                            overflowWrap: 'break-word',
                            wordWrap: 'break-word'
                        }}
                    >
                        {address}
                    </Typography>
                </>
            )}
        </Box>
    );
};

export default Address;
