import React, { useMemo, useEffect, Fragment } from "react";
import { useLocation } from "react-router-dom";
import { generate } from "geopattern";
import { BigNumber } from "@ethersproject/bignumber";
import { DecodedTxInput } from "../../pointsdk/index.d";
import Address from "./Address";
import Price from "./Price";
import RawData from "./RawData";
import DecodedData from "./DecodedData";

const TxDetails = () => {
    const { search } = useLocation();
    const query = useMemo(() => new URLSearchParams(search), [search]);

    const rawParams = useMemo((): Record<string, string> => {
        try {
            const str = query.get("params");
            return str ? (JSON.parse(str) as Record<string, string>) : {};
        } catch {
            return {};
        }
    }, [query]);

    const decodedTxData = useMemo((): DecodedTxInput | null => {
        try {
            const str = query.get("decodedTxData");
            return str ? (JSON.parse(str) as DecodedTxInput) : null;
        } catch {
            return null;
        }
    }, [query]);

    const network = useMemo(() => query.get("network") || "", [query]);

    useEffect(() => {
        async function drawBg() {
            try {
                const {
                    data: { hash },
                } = await window.point.wallet.hash();
                document.body.style.backgroundImage = generate(
                    String(hash),
                ).toDataUrl();
            } catch (e) {
                console.error(e);
            }
        }
        void drawBg();
    }, [rawParams]);

    return (
        <>
            {Object.entries(rawParams).map(([key, value], idx) => {
                switch (key) {
                    case "from":
                    case "to":
                        return (
                            <Address key={idx} label={key} address={value} />
                        );
                    case "value":
                    case "gas":
                    case "gasPrice":
                        return (
                            <Price
                                key={idx}
                                label={key}
                                value={value}
                                network={network}
                            />
                        );
                    case "data":
                        if (decodedTxData) {
                            return (
                                <Fragment key={idx}>
                                    <DecodedData data={decodedTxData} />
                                    <RawData label="data (raw)" data={value} />
                                </Fragment>
                            );
                        }
                        return <RawData key={idx} label={key} data={value} />;
                    default:
                        return <RawData key={idx} label={key} data={value} />;
                }
            })}

            {/* TODO: shouldn't gasPrice be multiplied by the gas limit? */}
            {rawParams.value && rawParams.gasPrice ? (
                <Price
                    label="Total Price Estimate"
                    network={network}
                    value={BigNumber.from(rawParams.value)
                        .add(rawParams.gasPrice)
                        .toString()}
                />
            ) : null}
        </>
    );
};

export default TxDetails;
