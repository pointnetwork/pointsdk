import React, {FunctionComponent} from 'react';
import {BlockchainContext, useBlockchain} from './context/blockchain';
import Layout from './components/Layout';

const App: FunctionComponent = () => {
    const blockchainContext = useBlockchain();

    return (
        <BlockchainContext.Provider value={blockchainContext}>
            <Layout />
        </BlockchainContext.Provider>
    );
};
export default App;
