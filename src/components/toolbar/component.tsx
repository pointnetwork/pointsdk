import React, { useContext } from "react";
import { AppContext } from "@src/context";
// import { Types } from "@src/types/shared";
import {
    ICON_DRIVE,
    ICON_MESSAGING,
    ICON_WALLET,
    ICON_NOTIFICATION,
    ICON_TERMINAL,
    ICON_EMAIL,
} from "@src/utils/constants/icons";
import {
    WALLET,
    DRIVE,
    EMAIL,
    MESSENGER,
    TERMINAL,
    NOTIFICATION,
} from "@src/utils/constants";
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
                src={ICON_WALLET.default}
                alt="point-wallet"
            />
            <img
                onClick={() => dispatchToStore(DRIVE)}
                className="toolbar_icons"
                src={ICON_DRIVE.default}
                alt="point-drive"
            />
            <img
                onClick={() => dispatchToStore(EMAIL)}
                className="toolbar_icons"
                src={ICON_EMAIL.default}
                alt="point-email"
            />
            <img
                onClick={() => dispatchToStore(MESSENGER)}
                className="toolbar_icons"
                src={ICON_MESSAGING.default}
                alt="point-messenger"
            />
            <img
                onClick={() => dispatchToStore(TERMINAL)}
                className="toolbar_icons"
                src={ICON_TERMINAL.default}
                alt="point-terminal"
            />
            <img
                onClick={() => dispatchToStore(NOTIFICATION)}
                className="toolbar_icons"
                src={ICON_NOTIFICATION.default}
                alt="point-notification"
            />
        </div>
    );
};
