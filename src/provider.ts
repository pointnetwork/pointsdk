export default (host: string) => {
    const apiCall = async (request: any) => {
        return await window.top.fetch(`${host}/v1/api/blockchain`, {
            method: "POST",
            cache: "no-cache",
            credentials: "include",
            keepalive: true,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        });
    };

    return {
        request: async function (request: any) {
            try {
                console.log("request", request);
                // First, we call wallet_getPermissions to check if user has given permissions or not
                let response = await apiCall({
                    method: "wallet_getPermissions",
                });
                let data = await response.json();
                console.log("wallet_getPermissions", data);
                if (
                    !data.data ||
                    !data.data.parentCapabilities.includes(request.method)
                ) {
                    // If not, then we open a confirmation dialog to ask whether user wants to give permissions
                    const choice = window.confirm(
                        `This site is asking for permissions to send transaction on your behalf. Do you want to allow this action?`,
                    );
                    // If yes, then we call the wallet_requestPermissions to add the method to allowed permissions
                    if (choice) {
                        response = await apiCall({
                            method: "wallet_requestPermissions",
                            params: [
                                {
                                    [request.method]: {},
                                },
                            ],
                        });
                        data = await response.json();
                        console.log("wallet_requestPermissions", data);
                    } else {
                        throw new Error("Permission not granted");
                    }
                }

                // @ts-ignore, https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#xhr_and_fetch
                // Then we proceed to call the method normally
                response = await apiCall(request);
                data = await response.json();
                console.log(request.method, data);

                return data;
            } catch (error) {
                console.error(error);
                return error;
            }
        },
    };
};
