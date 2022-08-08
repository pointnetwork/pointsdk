import React, { FunctionComponent } from "react";
import { BrowserRouter } from "react-router-dom";
import UIThemeProvider from "pointsdk/theme/UIThemeProvider";
import ConfirmationWindow from "./ConfirmationWindow";

const App: FunctionComponent = () => (
    <BrowserRouter>
        <UIThemeProvider>
            <ConfirmationWindow />
        </UIThemeProvider>
    </BrowserRouter>
);

export default App;
