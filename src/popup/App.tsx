import React, {FunctionComponent} from 'react';
import {MemoryRouter as Router, Routes, Route} from 'react-router-dom';
import UIThemeProvider from 'pointsdk/theme/UIThemeProvider';
import {BlockchainContext, useBlockchain} from './context/blockchain';
import {NotificationsProvider} from './context/notifications';
import Layout from './components/Layout';
import Notifications from './components/Notifications';

const App: FunctionComponent = () => {
    const blockchainContext = useBlockchain();

    return (
        <BlockchainContext.Provider value={blockchainContext}>
            <NotificationsProvider>
                <UIThemeProvider>
                    <Router>
                        <Routes>
                            <Route path="/notifications" element={<Notifications />} />
                            <Route path="/" element={<Layout />} />
                        </Routes>
                    </Router>
                </UIThemeProvider>
            </NotificationsProvider>
        </BlockchainContext.Provider>
    );
};

export default App;
