import React, { useContext } from "react";
import { buy, sell } from "pointsdk/utils/constants/icons";
import { AppContext } from "pointsdk/context";
import "./style.scss";

export const Wallet: React.FC = () => {
    const { state } = useContext(AppContext);

    return (
        <div className="wallet">
            <span className="wallet_node_address_text">Node Address</span>
            <span className="wallet_node_address">{state.wallet.address}</span>
            <div className="wallet_balance">
                <span className="wallet_balance_point">
                    {state.wallet.funds} POINT
                </span>
                <span className="wallet_balance_usd">
                    ${state.wallet.fundsUsd} USD
                </span>
            </div>
            <div className="wallet_icon_actions">
                <div className="wallet_action">
                    <img
                        className="wallet_icon"
                        src={sell}
                        alt="point-sell"
                    />
                    <span>Sell</span>
                </div>
                <div className="wallet_action">
                    <img
                        className="wallet_icon"
                        src={buy}
                        alt="point-buy"
                    />
                    <span>Buy</span>
                </div>
            </div>
        </div>
    );
};
