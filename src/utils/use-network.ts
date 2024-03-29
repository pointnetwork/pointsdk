import {useState, useEffect} from 'react';
import browser from 'webextension-polyfill';
import type {Network} from '../pointsdk/index.d';

type Networks = Record<string, Network>;
type EmptyObj = Record<string, never>;
type StorageResp = {networks: string} | EmptyObj;

export default function useNetwork(networkName: string) {
    const [network, setNetwork] = useState<Network | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const networksRes = (await browser.storage.local.get('networks')) as StorageResp;

                const networks = networksRes.networks
                    ? (JSON.parse(networksRes.networks) as Networks)
                    : null;

                if (!networks) {
                    throw new Error('No networks found in extenstion storage.');
                }

                setNetwork(networks[networkName] || null);
            } catch (e) {
                console.error('Failed to get networks', e);
                setNetwork(null);
            } finally {
                setLoading(false);
            }
        }

        void fetchData();
    }, [networkName]);

    return {network, loading};
}
