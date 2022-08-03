import { useCallback, useEffect, useState } from "react";
import { formatEther } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";
import { generate } from "geopattern";
import browser from "webextension-polyfill";
import { DecodedTxInput } from "../pointsdk/index.d";

const useConfirmationWindow = (
    rawParams: Record<string, string>,
    network: string,
    decodedTxData: DecodedTxInput | null,
) => {
    const [params, setParams] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const renderDecodedTxData = () => {
        if (!decodedTxData) {
            return "";
        }

        let html = "";
        html += "<div style='marin-bottom: 8px;'>";
        html += "<p style='color: #9e9e9e; margin: 8px 0;'>Contract Method: ";
        html += `<span style='color: #7c4dff; font-weight: bold;'>${decodedTxData.name}</span>`;
        html += "</p>";

        if (decodedTxData.params && decodedTxData.params.length > 0) {
            html += "<div>";
            html += "<p style='color: #9e9e9e;'>Method Params:</p>";
            html += "<ul style='margin-left: 32px;'>";
            decodedTxData.params.forEach((p) => {
                html += `<li style='color: #9e9e9e;'>${p.name}: ${p.value}</li>`;
            });
            html += "</ul>";
            html += "</div>";
        }

        html += "</div>";
        return html;
    };

    const processParams = useCallback(async () => {
        setLoading(true);
        const processedParams: Record<string, string> = {};
        let userAddress;
        let networks;
        try {
            const networksRes = await browser.storage.local.get("networks");
            networks = JSON.parse(networksRes.networks);
        } catch (e) {
            console.error("Failed to get networks", e);
        }
        try {
            const { data } = await window.point.wallet.address();
            userAddress = data.address;
        } catch (e) {
            console.error("Failed to fetch user address", e);
        }
        for (const key in rawParams) {
            try {
                switch (key) {
                    case "from":
                    case "to":
                        const res = await window.point.identity.ownerToIdentity(
                            { owner: rawParams[key] },
                        );
                        if (res?.data?.identity) {
                            const isYourIdentity =
                                rawParams[key].toLowerCase() ===
                                userAddress.toLowerCase();
                            processedParams[key] = `${
                                isYourIdentity
                                    ? `<span style="color: #7c4dff; font-weight: bold;">${res.data.identity} (You)</span>`
                                    : res.data.identity
                            } <span style="color: #9e9e9e;">${
                                rawParams[key]
                            }</span>`;
                        } else {
                            processedParams[
                                key
                            ] = `<span style="color: #9e9e9e;">${rawParams[key]}</span>`;
                        }
                        break;
                    case "value":
                    case "gas":
                    case "gasPrice":
                        processedParams[
                            key
                        ] = `<span style="color: #7c4dff; font-weight: bold;">${formatEther(
                            rawParams[key],
                        )}</span> ${networks[network]?.currency_name ?? "Eth"}`;
                        break;
                    case "data":
                        const rawData = `<span style="color: #9e9e9e;">${
                            typeof rawParams[key] === "string"
                                ? rawParams[key]
                                : JSON.stringify(rawParams[key])
                        }</span>`;

                        if (!decodedTxData) {
                            processedParams["data"] = rawData;
                        } else {
                            processedParams["data"] = renderDecodedTxData();
                            processedParams["data (raw)"] = rawData;
                        }
                        break;
                    default:
                        processedParams[key] = `<span style="color: #9e9e9e;">${
                            typeof rawParams[key] === "string"
                                ? rawParams[key]
                                : JSON.stringify(rawParams[key])
                        }</span>`;
                }
            } catch (e) {
                console.error(`Error decoding param ${key}`, e);
                processedParams[key] = rawParams[key];
            }
        }
        if (rawParams.value && rawParams.gasPrice) {
            try {
                processedParams[
                    "Total Price"
                ] = `<span style="color: #ef6c00; font-weight: bold; font-size: 1rem;">${formatEther(
                    BigNumber.from(rawParams.value)
                        .add(rawParams.gasPrice)
                        .toString(),
                )}</span> ${networks[network]?.currency_name ?? "Eth"}`;
            } catch (e) {
                console.error("Failed to calculate");
            }
        }

        setParams(processedParams);
        setLoading(false);
    }, [rawParams, network, setParams, setLoading]);

    const drawBg = async () => {
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
    };
    useEffect(() => {
        void processParams();
        void drawBg();
    }, [rawParams]);

    return {
        params,
        loading,
    };
};

export default useConfirmationWindow;
