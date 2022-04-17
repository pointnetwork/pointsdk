import React, { ReactEventHandler, Fragment } from "react";

const data = {
    From: "0x916f8e7566dd63d7c444468cadea37e80f7f8048 (Your account)",
    To: "0x916f8e7566dd63d7c444468cadea37e80f7f8048",
    Value: parseInt("0x1bc16d674ec80000", 16),
    Gas: parseInt("0x76c0", 16),
    "Gas Price": parseInt("0x9184e72a000", 16),
    Data: "0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675",
};

const ConfirmationWindow = () => {
    const handleAllow: ReactEventHandler = () => {
        console.log("Transaction allowed");
    };

    const handleCancel: ReactEventHandler = () => {
        console.log("Transaction rejected");
    };

    return (
        <div className="confirmation-container">
            <h5 className="confirmation-title">{window.location.origin}</h5>
            <p>is trying to send a transaction</p>
            <div className="confirmation-data">
                {Object.entries(data).map(([key, value], index) => (
                    <Fragment key={index}>
                        <b>{key}</b>
                        <p>{value}</p>
                    </Fragment>
                ))}
            </div>
            <div className="confirmation-buttons">
                <button className="button button-primary" onClick={handleAllow}>
                    Allow
                </button>
                <button
                    className="button button-secondary"
                    onClick={handleCancel}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default ConfirmationWindow;
