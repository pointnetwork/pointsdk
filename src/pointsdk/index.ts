import { PointType } from './index.d';

export default (): PointType => {
    class PointSDKRequestError extends Error {};

    // const getAuthHeaders = () => ({ Authorization: 'Basic ' + btoa('WALLETID-PASSCODE') });
    const getAuthHeaders = () => ({ 'wallet-token': 'WALLETID-PASSCODE' });

    const apiCall = async (path: string, config?: RequestInit) => {
        try {
            // @ts-ignore, https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#xhr_and_fetch
            const response = await content.fetch(`${ window.location.origin }/v1/api/${path}`, {
                cache: 'no-cache',
                credentials: 'include',
                keepalive: true,
                ...config,
                headers: {
                    'Content-Type': 'application/json',
                    ...config?.headers
                }
            });

            if (!response.ok) {
                const {ok, status, statusText, headers} = response;
                console.error('SDK call failed:', {
                    // @ts-ignore
                    ok, status, statusText, headers: Object.fromEntries([ ...headers.entries() ])
                });
                throw new PointSDKRequestError('Point SDK request failed');
            }

            try {
                return await response.json();
            } catch (e) {
                console.error('Point API response parsing error:', e);
                throw e;
            }
        } catch (e) {
            console.error('Point API call failed:', e);
            throw e;
        }
    };

    const api = {
        get(pathname: string, query?: {[key: string]: string | number} | {}, headers?: RequestInit['headers']) {
            const search = Object.entries(query || {}).reduce((s, [k, v]) => `${s}${s ? '&' : '?'}${k}=${v}`, '');
            return apiCall(`${ pathname }${ search ? '/' : '' }${ search }`, { method: 'GET', headers });
        },
        post(pathname: string, body: Parameters<typeof JSON.stringify>[0], headers?: RequestInit['headers']) {
            return apiCall(pathname, { method: 'POST', headers, body: JSON.stringify(body) })
        },
    };

    return {
        status: {
            ping: () => api.get('status/ping', undefined, getAuthHeaders()),
        },
        contract: {
            call: (args) => api.post('contract/call', args, getAuthHeaders()),
            send: (args) => api.post('contract/send', args, getAuthHeaders()),
        },
        storage: {
            get: ({ id, ...args }) => api.get(`storage/get/${ id }`, args, getAuthHeaders()),
        },
        wallet: {
            address: () => api.get('wallet/address'),
            hash: () => api.get('wallet/hash'),
        },
    };
}