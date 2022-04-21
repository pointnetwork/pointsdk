import React, { FunctionComponent } from "react";
import { BrowserRouter } from "react-router-dom";
import ConfirmationWindow from "./ConfirmationWindow";

const App: FunctionComponent = () => (
    <BrowserRouter>
        <ConfirmationWindow />
    </BrowserRouter>
);

export default App;
