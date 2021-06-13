import React from "react";
import { ICON_POINT } from "@src/utils/constants/icons";
import "./style.scss";

export const Navigation: React.FC = () => {
    return (
        <div className="navigation">
            <img
                className="navigation_logo"
                src={ICON_POINT.default}
                alt="point-network"
            />
            <div className="navigation_dropdown">
                <span> Point Test Net </span>
            </div>
            <img
                className="navigation_profile_photo"
                src="https://d338t8kmirgyke.cloudfront.net/icons/icon_pngs/000/004/088/original/user.png"
                alt="point-profile"
            />
        </div>
    );
};
