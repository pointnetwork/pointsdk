export default (host: string) => {
    return {
        request: async function (request: any) {
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
            console.log(data);

            if (!response.ok) {
                throw new Error(data.message);
            }
            if (!data.result) {
                throw new Error("No `result` returned from RPC method.");
            }

            return data.result;
        },
    };
};
