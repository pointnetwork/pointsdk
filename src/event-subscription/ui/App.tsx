import React, {FunctionComponent} from 'react';
import {BrowserRouter} from 'react-router-dom';
import UIThemeProvider from 'pointsdk/theme/UIThemeProvider';
import Subscriptions from './Subscriptions';

const App: FunctionComponent = () => (
    <BrowserRouter>
        <UIThemeProvider>
            <Subscriptions />
        </UIThemeProvider>
    </BrowserRouter>
);

export default App;
