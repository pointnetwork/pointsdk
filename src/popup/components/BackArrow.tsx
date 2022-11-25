import React, {FunctionComponent} from 'react';
import {Link} from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

type Props = {
    to: string;
};

const BackArrow: FunctionComponent<Props> = ({to}: Props) => (
    <Link to={to}>
        <ArrowBackIcon color="disabled" />
    </Link>
);

export default BackArrow;
