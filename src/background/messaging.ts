import { v4 as uuid } from "uuid";
import {
    closeConfirmationWindow,
    displayConfirmationWindow,
} from "./confirmationWindowApi";

const socket = new WebSocket("wss://point/ws?token=POINTSDK_TOKEN");

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
                payload.request.method === "solana_sendTransaction"
                    ? {
                          to: payload.request.params[0],
                          lamports: payload.request.params[1],
                      }
                    : payload.request.params[0];
            displayConfirmationWindow(
                payload.data.reqId,
                payload.request.__point_id,
                payload.request.__hostname,
                params,
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
    const globalChainId = (await browser.storage.local.get("chainIdGlobal"))
        .chainIdGlobal as string;
    const { host } = new URL(message.__hostname);
    const hostChainId = (await browser.storage.local.get(`chainId_${host}`))[
        `chainId_${host}`
    ] as string;

    const msg = {
        ...message,
        network: hostChainId ?? globalChainId,
        type: "rpc",
        __point_id: messageId,
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
