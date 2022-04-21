import { v4 as uuid } from "uuid";

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
        responseHandlers[payload.request.__point_id](payload.data);
    } else {
        console.error(
            "Unexpeted message without data from point node: ",
            payload,
        );
    }
    delete responseHandlers[payload.request.__point_id];
};

socket.onerror = (err) => {
    console.error("WS error: ", err);
};

const rpcListener = async (message: any) => {
    const messageId = uuid();

    socket.send(
        JSON.stringify({
            ...message,
            type: "rpc",
            __point_id: messageId,
        }),
    );

    return new Promise<unknown>((resolve) => {
        responseHandlers[messageId] = resolve;
    });
};

export default rpcListener;
