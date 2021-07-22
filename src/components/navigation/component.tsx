import React from "react";
import { point, noProfile } from "pointsdk/utils/constants/icons";
import "./style.scss";

export const Navigation: React.FC = () => {
    return (
        <div className="navigation">
            <img
                className="navigation_logo"
                src={point}
                alt="point-network"
            />
            <div className="navigation_dropdown">
                <span> Point Test Net </span>
            </div>
            <img
                className="navigation_profile_photo"
                src={noProfile}
                alt="point-profile"
            />
        </div>
    );
};
