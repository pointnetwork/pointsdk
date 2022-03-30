import { JSONRPCClient } from "json-rpc-2.0";

interface ProviderInterface {
    request: Function;
    notify: Function;
}

// JSONRPCClient needs to know how to send a JSON-RPC request.
// Tell it by passing a function to its constructor. The function must take a JSON-RPC request and send it.
const client: any = new JSONRPCClient((jsonRPCRequest) =>
  fetch("http://localhost/json-rpc", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(jsonRPCRequest),
  }).then((response) => {
    if (response.status === 200) {
      // Use client.receive when you received a JSON-RPC response.
      return response
        .json()
        .then((jsonRPCResponse) => client.receive(jsonRPCResponse));
    } else if (jsonRPCRequest.id !== undefined) {
      return Promise.reject(new Error(response.statusText));
    }
  })
);

// That way we only expose the need it methods 
const provider: ProviderInterface = {
    request: client.request,
    notify: client.notify
};


window.wrappedJSObject.provider = cloneInto(
    provider,
    window,
    { cloneFunctions: true });
