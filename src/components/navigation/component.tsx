import React from "react";
import { point, noProfile } from "pointsdk/utils/constants/icons";
import "./style.scss";
import { browser } from "webextension-polyfill-ts";

export const Navigation: React.FC = () => {
    const version = browser.runtime.getManifest().version;
    return (
        <div className="navigation">
            <a href="https://point/">
                <img className="navigation_logo" src={point} alt="point-network" />
            </a>
            <div className="navigation_dropdown">
                <span><h3>Point Network</h3><br /><h5 className="navigation_version">v{version}</h5></span>
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
