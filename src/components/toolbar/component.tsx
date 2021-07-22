import React, { useContext } from "react";
import { AppContext } from "pointsdk/context";
// import { Types } from "pointsdk/types/shared";
import {
    drive,
    messaging,
    wallet,
    notification,
    terminal,
    email,
} from "pointsdk/utils/constants/icons";
import {
    WALLET,
    DRIVE,
    EMAIL,
    MESSENGER,
    TERMINAL,
    NOTIFICATION,
} from "pointsdk/utils/constants";
import "./style.scss";

export const Toolbar: React.FC = () => {
    const { dispatch } = useContext(AppContext);

    const dispatchToStore = (payload: string) => {
        return dispatch({
            type: "UPDATE_VIEW",
            payload,
        });
    };
    return (
        <div className="toolbar">
            <img
                onClick={() => dispatchToStore(WALLET)}
                className="toolbar_icons"
                src={wallet}
                alt="point-wallet"
            />
            <img
                onClick={() => dispatchToStore(DRIVE)}
                className="toolbar_icons"
                src={drive}
                alt="point-drive"
            />
            <img
                onClick={() => dispatchToStore(EMAIL)}
                className="toolbar_icons"
                src={email}
                alt="point-email"
            />
            <img
                onClick={() => dispatchToStore(MESSENGER)}
                className="toolbar_icons"
                src={messaging}
                alt="point-messenger"
            />
            <img
                onClick={() => dispatchToStore(TERMINAL)}
                className="toolbar_icons"
                src={terminal}
                alt="point-terminal"
            />
            <img
                onClick={() => dispatchToStore(NOTIFICATION)}
                className="toolbar_icons"
                src={notification}
                alt="point-notification"
            />
        </div>
    );
};
