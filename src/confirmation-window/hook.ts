import { useCallback, useEffect, useState } from "react";
import { formatEther } from "@ethersproject/units";
import NETWORKS from "pointsdk/constants/networks";
import { BigNumber } from "@ethersproject/bignumber";
import { generate } from "geopattern";

const useConfirmationWindow = (
    rawParams: Record<string, string>,
    network: string,
) => {
    const [params, setParams] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const processParams = useCallback(async () => {
        setLoading(true);
        const processedParams: Record<string, string> = {};
        let userAddress;
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
                        )}</span> ${NETWORKS[network]?.currency ?? "Eth"}`;
                        break;
                    case "data":
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
                )}</span> ${NETWORKS[network]?.currency ?? "Eth"}`;
            } catch (e) {
                console.error("Failed to calculate");
            }
        }

        setParams(processedParams);
        setLoading(false);
    }, [rawParams, network, setParams, setLoading]);

    const drawBg = useCallback(async () => {
        try {
            const hash = await window.point.wallet.hash();
            const pattern = generate(String(hash)).toDataUrl();
            document.body.style.backgroundImage = pattern;
        } catch (e) {
            console.error(e);
        }
    }, []);
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
