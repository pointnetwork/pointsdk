const path = require('path');
const PROTO_PATH = path.resolve(__dirname, './node.proto');

const GRPCClient = require('node-grpc-client');

const url = 'https://web3.test:9999';

const myClient = new GRPCClient(PROTO_PATH, 'packageservice', 'Services', url);
interface RequestArguments {
    readonly method: string;
    readonly params?: readonly unknown[] | object;
}

interface ExpectedResponse {
    readonly type: string;
    readonly data: unknown;
}

interface ProviderInterface {
    request: Function;
    isConnected: Function;
}



// options is optional and is supported from version 1.5.0
const options = {
    metadata: {
        info: 'test'
    }
};


const provider: ProviderInterface = {
    request: async function (request: RequestArguments) {
        try {
            const response: ExpectedResponse = await myClient.requestSync(request, options);
            console.log('The answer of request: ', response);
                
        } catch (error) {
            console.error(error);
            return error
        }
    },
    isConnected: async function () {
        try {
            const response: ExpectedResponse = await myClient.requestSync();
            console.log('The answer of isConnected: ', response);
                
        } catch (error) {
            console.error(error);
            return error
        }
    }
};



window.wrappedJSObject.provider = cloneInto(
    provider,
    window,
    { cloneFunctions: true });