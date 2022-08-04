import browser from "webextension-polyfill";
import { createContext, useEffect, useState } from "react";
import { SelectChangeEvent } from "@mui/material/Select";
import NETWORKS from "pointsdk/constants/networks";

export const useBlockchain = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [globalChainId, setGlobalChainId] = useState<string>("");
    const [host, setHost] = useState<string | null>(null);
    const [hostChainId, setHostChainId] = useState<string>("_unset");
    const [userData, setUserData] = useState({ address: "", identity: "" });
    const [balance, setBalance] = useState("");

    const chainId = (
        !hostChainId || hostChainId === "_unset" ? globalChainId : hostChainId
    ) as keyof typeof NETWORKS;

    const getCurrentChainIds = async () => {
        try {
            const [globalChainIdRes, tabs] = await Promise.all([
                browser.storage.local.get("chainIdGlobal"),
                browser.tabs.query({ active: true }),
            ]);
            setGlobalChainId(globalChainIdRes.chainIdGlobal ?? "xnet");
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

    const getBalance = async () => {
        if (!chainId) return;
        const res = await window.point.wallet.balance(chainId);
        setBalance(Number(Number(res.data.balance) / 1e18).toFixed(8));
    };

    useEffect(() => {
        void getBalance();
    }, [globalChainId, hostChainId]);

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
        chainId,
        handleGlobalNetworkChange,
        handleHostNetworkChange,
        userData,
        balance,
    };
};

export const BlockchainContext = createContext<
    ReturnType<typeof useBlockchain>
>({} as ReturnType<typeof useBlockchain>);
