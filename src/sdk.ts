import { PointType } from "pointsdk/types/point";

class PointSDKRequestError extends Error {};

const getAuthHeaders = () => ({ Authorization: 'Basic ' + btoa('WALLETID-PASSCODE') });

const apiCall = async (path: string, config?: RequestInit) => {
    try {
        const response = await fetch(`${ window.location.origin }/api/${path}`, {
            cache: 'no-cache',
            credentials: 'include',
            keepalive: true,
            headers: new Headers({
                'Content-Type': 'application/json',
                ...config?.headers
            }),
            ...config,
        });

        if (!response.ok) {
            const {ok, status, statusText, headers} = response;
            console.error('SDK call failed:', {ok, status, statusText, headers: [...headers.entries()] })
            throw new PointSDKRequestError('Point SDK request failed');
        }
        return response;
    } catch (e) {
        console.error('Point API call failed:', e);
        throw e;
    }
};

const api = {
    get(pathname: string, query?: {[key: string]: string | number}, headers?: RequestInit['headers']) {
        const search = Object.entries(query || {}).reduce((s, [k, v]) => `${s}${s ? '&' : '?'}${k}=${v}`, '');
        return apiCall(`${pathname}/${search}`, { method: 'GET', headers });
    },
    post(pathname: string, body: Parameters<typeof JSON.stringify>[0], headers?: RequestInit['headers']) {
        return apiCall(pathname, { method: 'POST', headers, body: JSON.stringify(body) })
    },
};

export default {
    contract: {
        call: async (args) => {
            const response = await api.post('contract/call', args, getAuthHeaders());
            try {
                return response.json();
            } catch (e) {
                console.error('Parsing error:', { e, response });
                throw e;
            }
        },
        send: () => console.log('Contract.send'),
    },
    storage: {
        get: async () => true,
    },
    wallet: {
        address: async () => {
            const response = await api.get('wallet/address');
            return response.text();
        },
        hash: async () => {
            const response = await api.get('wallet/hash');
            return response.text();
        },
    },
} as PointType;
