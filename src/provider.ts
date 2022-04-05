

const URL = 'https://web3.test/'; 

export default () => {
    return { 
        request: async function (request: any) {
            try {
                // @ts-ignore, https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#xhr_and_fetch
                  const response = await window.top.fetch(URL, {
                    cache: "no-cache",
                    credentials: "include",
                    keepalive: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                if (response){
                    console.log(response);
                    const message = response;
                    return message
                }
    
    
            } catch (error) {
                console.error(error);
                return error
            }
        }
     }
}