import { v4 as uuid } from "uuid";
import {
    closeConfirmationWindow,
    displayConfirmationWindow,
} from "./confirmationWindowApi";
import { sign } from "jsonwebtoken";

const socket = new WebSocket("wss://point/ws");

const responseHandlers: Record<string, (v: unknown) => void> = {};

socket.onopen = () => {
    console.log("WS Connection with point node established");
};

socket.onmessage = (e) => {
    const payload = JSON.parse(e.data);

    console.log("Message from node: ", payload);

    if (!payload?.request?.__point_id) {
        console.error(
            "Unexpected message without __point_id from point node: ",
            payload,
        );
        return;
    }
    if (!responseHandlers[payload.request.__point_id]) {
        console.error("No handler for message from point node: ", payload);
        return;
    }

    if (payload.data) {
        if (payload.data.reqId) {
            const params =
                payload.request.method === "solana_sendTransaction" &&
                Array.isArray(payload.request.params[0].instructions)
                    ? payload.request.params[0].instructions[0]
                    : payload.request.params[0];
            displayConfirmationWindow(
                payload.data.reqId,
                payload.request.__point_id,
                payload.request.__hostname,
                payload.data.network,
                params,
                payload.data.decodedTxData,
            );
        } else {
            responseHandlers[payload.request.__point_id](payload.data);
            delete responseHandlers[payload.request.__point_id];
        }
    } else {
        console.error(
            "Unexpected message without data from point node: ",
            payload,
        );
    }
};

socket.onerror = (err) => {
    console.error("WS error: ", err);
};

export const rpcListener = async (message: any) => {
    const messageId = uuid();
    let network;
    switch (message.__provider) {
        case "eth":
            const globalChainId = (
                await browser.storage.local.get("chainIdGlobal")
            ).chainIdGlobal as string;
            const { host } = new URL(message.__hostname);
            const hostChainId = (
                await browser.storage.local.get(`chainId_${host}`)
            )[`chainId_${host}`] as string;
            network = hostChainId ?? globalChainId;
            break;
        case "solana":
            network = "solana_devnet"; // TODO
            break;
        default:
            throw new Error(
                `Unknown or missing provider type ${message.__provider}`,
            );
    }

    const msg = {
        ...message,
        network,
        type: "rpc",
        __point_id: messageId,
        __point_token: (await getAuthToken()).token,
    };
    console.log("Sending msg to node: ", msg);
    socket.send(JSON.stringify(msg));

    return new Promise<unknown>((resolve) => {
        responseHandlers[messageId] = resolve;
    });
};

export const confirmationWindowListener = async (message: any) => {
    if (message.confirm) {
        const msg = {
            method: "eth_confirmTransaction",
            type: "rpc",
            __point_id: message.pointId,
            __point_token: (await getAuthToken()).token,
            params: [
                {
                    reqId: message.reqId,
                },
            ],
        };
        console.log("Sending confirmation msg to node, ", msg);
        socket.send(JSON.stringify(msg));
    } else {
        responseHandlers[message.pointId]({
            code: 4001,
            message: "User rejected the request",
        });
        delete responseHandlers[message.pointId];
    }
    await closeConfirmationWindow();
};

export const registerHandlerListener = async (message: any) =>
    new Promise<unknown>((resolve) => {
        responseHandlers[message.messageId] = resolve;
    });
export const setAuthTokenHandler = async (message: any) => {
    await browser.storage.local.set({ point_token: message.token });
    return { ok: true };
};

export const getAuthToken = async () => {
    const { point_token } = await browser.storage.local.get("point_token");
    if (!point_token) {
        throw new Error("Point token not set");
    }
    const jwt = sign({ payload: "point_token" }, point_token, {
        expiresIn: "10s",
    });
    return { token: jwt };
};
