export const SUBSCRIPTION_MESSAGE_TYPE = 'event-subscription';
export const SUBSCRIPTION_STORAGE_KEY = 'subscription_preferences';

export enum SubscriptionMessageMethod {
    WINDOW_CLOSE = 'window_close',
    WINDOW_NOT_AGAIN = 'window_not_again',
    WINDOW_LATER = 'window_later',
    EVENTS_SUBSCRIBE = 'events_subscribe'
}

export type SubscriptionMessage = {
    __message_type: typeof SUBSCRIPTION_MESSAGE_TYPE;
    method: SubscriptionMessageMethod;
    payload?: string[];
};

export type SubscriptionPreferences = {
    [host: string]: {
        doNotAskBefore: string;
    };
};

export type ContractEvent = {
    contractName: string;
    events: string[];
};

export type ApiResponse<T> = {
    status: number;
    headers: Record<string, unknown>;
    data: T;
};

export type EmptyObj = Record<string, never>;
