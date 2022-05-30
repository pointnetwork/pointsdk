import browser from "webextension-polyfill";
import { createContext, useEffect, useState } from "react";
import { SelectChangeEvent } from "@mui/material/Select";

export const useBlockchain = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [globalChainId, setGlobalChainId] = useState<string>("");
    const [host, setHost] = useState<string | null>(null);
    const [hostChainId, setHostChainId] = useState<string>("_unset");
    const [userData, setUserData] = useState({ address: "", identity: "" });

    const getCurrentChainIds = async () => {
        try {
            const [globalChainIdRes, tabs] = await Promise.all([
                browser.storage.local.get("chainIdGlobal"),
                browser.tabs.query({ active: true }),
            ]);
            setGlobalChainId(globalChainIdRes.chainIdGlobal ?? "ynet");
            if (tabs[0] && tabs[0].url?.startsWith("https://")) {
                const url = new URL(tabs[0].url);
                setHost(url.host);
                const hostChainIdRes = await browser.storage.local.get(
                    `chainId_${url.host}`,
                );
                if (hostChainIdRes[`chainId_${url.host}`]) {
                    setHostChainId(hostChainIdRes[`chainId_${url.host}`]);
                }
            } else {
                setHost(null);
            }
        } catch (e) {
            console.error("Failed to get chain ids: ", e);
        }
    };

    const getUserData = async () => {
        const addressRes = await window.point.wallet.address();
        const address: string = addressRes.data.address;
        const identityRes = await window.point.identity.ownerToIdentity({
            owner: address,
        });
        const identity: string = identityRes.data.identity;
        // res = await window.point.wallet.balance();
        // const balance = Number(
        //     Number(res.data.balance) / 1000000000000000000,
        // ).toFixed(8);
        setUserData({ address, identity });
    };

    const init = async () => {
        setLoading(true);
        await Promise.all([getCurrentChainIds(), getUserData()]);
        setLoading(false);
    };

    useEffect(() => {
        void init();
    }, []);

    const handleGlobalNetworkChange = async (e: SelectChangeEvent) => {
        await browser.storage.local.set({ chainIdGlobal: e.target.value });
        setGlobalChainId(e.target.value);
    };

    const handleHostNetworkChange = async (e: SelectChangeEvent) => {
        if (!host) return;
        if (e.target.value === "_unset") {
            await browser.storage.local.remove(`chainId_${host}`);
        } else {
            await browser.storage.local.set({
                [`chainId_${host}`]: e.target.value,
            });
        }
        setHostChainId(e.target.value);
    };

    return {
        loading,
        host,
        globalChainId,
        hostChainId,
        handleGlobalNetworkChange,
        handleHostNetworkChange,
        userData,
    };
};

export const BlockchainContext = createContext<
    ReturnType<typeof useBlockchain>
>({} as ReturnType<typeof useBlockchain>);
