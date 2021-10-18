import React from "react";
import { point, noProfile } from "pointsdk/utils/constants/icons";
import "./style.scss";

export const Navigation: React.FC = () => {
    return (
        <div className="navigation">
            <a href="https://point/">
                <img className="navigation_logo" src={point} alt="point-network" />
            </a>
            <div className="navigation_dropdown">
                <span><h3>Point Network</h3></span>
            </div>

            <a className="navigation_profile_photo_link" href="https://point/">
                <img
                    className="navigation_profile_photo"
                    src={noProfile}
                    alt="point-profile"
                />
            </a>
        </div>
    );
};
