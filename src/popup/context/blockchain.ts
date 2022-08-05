import browser from "webextension-polyfill";
import { createContext, useEffect, useState } from "react";
import { SelectChangeEvent } from "@mui/material/Select";
import { Network } from "pointsdk/types/networks";

export const useBlockchain = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [networks, setNetworks] = useState<Record<string, Network>>({});
    const [defaultNetwork, setDefaultNetwork] = useState("");
    const [globalChainId, setGlobalChainId] = useState<string>("");
    const [host, setHost] = useState<string | null>(null);
    const [hostChainId, setHostChainId] = useState<string>("_unset");
    const [userData, setUserData] = useState({ address: "", identity: "" });
    const [balance, setBalance] = useState("");

    const chainId =
        !hostChainId || hostChainId === "_unset" ? globalChainId : hostChainId;

    const getCurrentChainIds = async () => {
        try {
            const [networksRes, defaultNetworkRes] = await Promise.all([
                browser.storage.local.get("networks"),
                browser.storage.local.get("default_network"),
            ]);
            const allNetworks = JSON.parse(networksRes.networks);
            setNetworks(allNetworks);
            setDefaultNetwork(defaultNetworkRes.default_network);

            const [globalChainIdRes, tabs] = await Promise.all([
                browser.storage.local.get("chainIdGlobal"),
                browser.tabs.query({ active: true }),
            ]);

            if (
                !globalChainIdRes.chainIdGlobal ||
                !(globalChainIdRes.chainIdGlobal in allNetworks)
            ) {
                setGlobalChainId(defaultNetworkRes.default_network);
            } else {
                setGlobalChainId(globalChainIdRes.chainIdGlobal);
            }
            if (tabs[0] && tabs[0].url?.startsWith("https://")) {
                const url = new URL(tabs[0].url);
                setHost(url.host);
                const hostChainIdRes = await browser.storage.local.get(
                    `chainId_${url.host}`,
                );
                if (
                    hostChainIdRes[`chainId_${url.host}`] &&
                    hostChainIdRes[`chainId_${url.host}`] in allNetworks
                ) {
                    setHostChainId(hostChainIdRes[`chainId_${url.host}`]);
                } else {
                    setHostChainId("_unset");
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
        networks,
        defaultNetwork,
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
