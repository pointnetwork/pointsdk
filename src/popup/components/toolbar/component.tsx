import React from "react";

import { messaging, wallet, email } from "pointsdk/utils/constants/icons";
import "./style.scss";

export const Toolbar: React.FC = () => {
    return (
        <div className="toolbar">
            <a href="http://point/wallet">
                <img
                    className="toolbar_icons"
                    src={wallet}
                    alt="point-wallet"
                />
            </a>
            <a href="http://email.z">
                <img className="toolbar_icons" src={email} alt="point-email" />
            </a>
            <a href="http://point/identities">
                <img
                    className="toolbar_icons"
                    src={messaging}
                    alt="point-messenger"
                />
            </a>
        </div>
    );
};
