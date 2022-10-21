import React, {ReactElement} from 'react';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import createTheme from '@mui/material/styles/createTheme';
import deepPurple from '@mui/material/colors/deepPurple';
import blueGrey from '@mui/material/colors/blueGrey';
import grey from '@mui/material/colors/grey';

const theme = createTheme({
    typography: {fontFamily: 'Arial'},
    palette: {
        primary: {
            main: deepPurple.A200,
            light: blueGrey[50]
        },
        text: {secondary: grey[500]}
    }
});

export default function UIThemeProvider({children}: {children: ReactElement[] | ReactElement}) {
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
