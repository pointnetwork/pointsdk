export default (host: string) => {
    return {
        request: async function (request: any) {
            try {
                // @ts-ignore, https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#xhr_and_fetch
                const response = await window.top.fetch(
                    `${host}/v1/api/blockchain`,
                    {
                        method: "POST",
                        cache: "no-cache",
                        credentials: "include",
                        keepalive: true,
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(request),
                    },
                );

                const data = await response.json();
                return data;
            } catch (error) {
                console.error(error);
                return error;
            }
        },
    };
};
