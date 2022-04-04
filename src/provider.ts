import axios from "axios";

const URL = 'https://web3.test:9999/';
// const URL = 'https://product-details.mozilla.org/1.0/firefox_versions.json'; test is connected

interface RequestArguments {
    readonly method: string;
    readonly params?: readonly unknown[] | object;
}

interface ProviderRpcError extends Error {
    code: number;
    data?: unknown;
}

interface ProviderMessage {
    readonly type: string;
    readonly data: unknown;
}

interface ProviderInterface {
    request: Function;
    isConnected: Function;
}


const ethereum: ProviderInterface = {
    request: async function (request: RequestArguments) {
        try {
            const response = await axios.post(URL, request);
            if (response.data){
                console.log(response.data);
                const message: ProviderMessage = response.data;
                return message
            }

            if (response.status !== 200){
                console.log(response);
                const messageError: ProviderRpcError = response.data;
                return messageError
            }

        } catch (error) {
            console.error(error);
            return error
        }
    },
    isConnected: async function () {
        try {
            const response = await axios.get(URL);
            console.log(response)
            if (response.status = 200) {
                return true
            }
            return false
        } catch (error) {
            console.log(error)
            return false
        }
    }
};



window.wrappedJSObject.ethereum = cloneInto(
    ethereum,
    window,
    { cloneFunctions: true }); 

