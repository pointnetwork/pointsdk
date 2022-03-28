import axios from "axios";

const provider = {
    getProvider: async function (url: string) {
        try {
            const response = await axios.get(url);
            console.log(response);
        } catch (error) {
            console.error(error);
        }
    }
};

window.wrappedJSObject.provider = cloneInto(
    provider,
    window,
    { cloneFunctions: true });