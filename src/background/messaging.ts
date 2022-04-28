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
            displayConfirmationWindow(
                payload.data.reqId,
                payload.request.__point_id,
                payload.request.__hostname,
                payload.request.params && payload.request.params[0],
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

    socket.send(
        JSON.stringify({
            ...message,
            network: hostChainId ?? globalChainId,
            type: "rpc",
            __point_id: messageId,
        }),
    );

    return new Promise<unknown>((resolve) => {
        responseHandlers[messageId] = resolve;
    });
};

export const confirmationWindowListener = async (message: any) => {
    if (message.confirm) {
        socket.send(
            JSON.stringify({
                method: "eth_confirmTransaction",
                type: "rpc",
                __point_id: message.pointId,
                params: [
                    {
                        reqId: message.reqId,
                    },
                ],
            }),
        );
    } else {
        responseHandlers[message.pointId]({
            code: 4001,
            message: "User rejected the request",
        });
        delete responseHandlers[message.pointId];
    }
    await closeConfirmationWindow();
};
