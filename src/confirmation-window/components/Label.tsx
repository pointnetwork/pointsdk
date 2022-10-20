import React from 'react';
import Typography from '@mui/material/Typography';

type Props = {
    children: string;
};

const Label = ({children}: Props) => (
    <Typography variant="body2" fontWeight="600" sx={{textTransform: 'capitalize'}}>
        {children}
    </Typography>
);

export default Label;
