import browser from 'webextension-polyfill';
import {
    SubscriptionMessage,
    SubscriptionMessageMethod,
    SUBSCRIPTION_STORAGE_KEY,
    SubscriptionPreferences,
    EmptyObj,
    ApiResponse,
    ContractEvent
} from './types';
import {nowIsAfter, nowPlusDays} from '../utils/date';

class SubscriptionsController {
    private eventsByHost: Record<string, ContractEvent[]> = {};
    private currentWindow: {host: string; id: number} | null = null;

    /**
     * Attaches listener to detect visits to dApps and check if the contracts
     * they use have any events users could subscribe to.
     */
    init() {
        browser.history.onVisited.addListener((historyItem: browser.History.HistoryItem) => {
            void this.handleVisit(historyItem);
        });
    }

    /**
     * Handler that checks if the visited page is `.point` and, if so, fires a request
     * to get a list of events implemented in the smart contract (if any).
     */
    private handleVisit = async (historyItem: browser.History.HistoryItem) => {
        try {
            const {host} = new URL(historyItem.url ?? '');
            if (host.endsWith('.point')) {
                // Check user preferences about being asked.
                const preferences = await this.loadPreferencesForHost(host);
                if (!preferences || nowIsAfter(preferences.doNotAskBefore)) {
                    void this.getEvents(host);
                }
            }
        } catch {
            // `historyItem.url` is not a proper URL, so we simply ignore it.
        }
    };

    /**
     * Retrieves preferences stored in extension storage and returns the ones
     * corresponding to the given host.
     */
    private async loadPreferencesForHost(host: string) {
        const preferences = (await browser.storage.local.get(SUBSCRIPTION_STORAGE_KEY)) as
            | {[SUBSCRIPTION_STORAGE_KEY]: SubscriptionPreferences}
            | EmptyObj;

        if (JSON.stringify(preferences) === '{}') {
            return undefined;
        }

        return preferences[SUBSCRIPTION_STORAGE_KEY][host];
    }

    /**
     * Flatten ContractEvent data into a string[].
     */
    private flatten(data: ContractEvent[]): string[] {
        const result: string[] = [];
        data.forEach(i => {
            i.events.forEach(e => result.push(`${i.contractName}:${e}`));
        });
        return result;
    }

    /**
     * Turned previously flattened ContractEvent data back into its original form.
     */
    private expand(data: string[]): ContractEvent[] {
        const eventsByContract: Record<string, string[]> = {};
        data.forEach(str => {
            const parts = str.split(':');
            if (parts.length >= 2) {
                const contract = parts.shift()!;
                const event = parts.join(':');
                if (eventsByContract[contract]) {
                    eventsByContract[contract]!.push(event);
                } else {
                    eventsByContract[contract] = [event];
                }
            }
        });
        return Object.entries(eventsByContract).map(([k, v]) => ({contractName: k, events: v}));
    }

    /**
     * Gets events for a given host.
     * If host has been visited before, the events are cached, if not, they
     * will be requested from Point Engine.
     */
    async getEvents(host: string) {
        try {
            if (!this.eventsByHost[host]) {
                const resp = await window.top.fetch(
                    `https://point/v1/api/contract/listEvents/${host.replace(/.point$/, '')}`
                );

                const {data: events} = (await resp.json()) as ApiResponse<ContractEvent[]>;
                this.eventsByHost[host] = events;
            }

            if (this.eventsByHost[host]?.length !== 0) {
                void this.renderUI(host);
            }
        } catch {
            // If there's an error getting events, we don't cache anything, so on the next
            // visit to the same host, another attempt is made at getting the events.
        }
    }

    /**
     * Renders UI for users to decide if they wish to subscribe to any events.
     */
    async renderUI(host: string) {
        // Make sure to close any possible open windows, so we show one at a time.
        await this.close();

        const flattened = this.flatten(this.eventsByHost[host] ?? []);
        const query = new URLSearchParams();
        query.append('host', host);
        query.append('events', JSON.stringify(flattened));

        const win = await browser.windows.create({
            type: 'detached_panel',
            width: 400,
            height: 600,
            url: `./event-subscription/ui/index.html?${query.toString()}`
        });

        // Keep track of the new window ID.
        this.currentWindow = {host, id: win.id!};
    }

    /**
     * Closes the currently open window.
     * (only one window can be open at a time)
     */
    async close() {
        if (this.currentWindow) {
            await browser.windows.remove(this.currentWindow.id);
            this.currentWindow = null;
        }
    }

    /**
     * Subscribes to contract events.
     * TODO: to be implemented.
     */
    subscribe(events: string[]) {
        const contractEvents = this.expand(events);
        console.log('User wants to subscribe to the following events:');
        console.log({host: this.currentWindow?.host, contractEvents});
    }

    /**
     * Updates preferences in extension storage.
     */
    private async updateDoNotAskBefore(host: string, days: number) {
        const preferences = (await browser.storage.local.get(SUBSCRIPTION_STORAGE_KEY)) as
            | {[SUBSCRIPTION_STORAGE_KEY]: SubscriptionPreferences}
            | EmptyObj;

        const updatedPreferences: SubscriptionPreferences = {
            ...(preferences[SUBSCRIPTION_STORAGE_KEY] ?? {}),
            [host]: {doNotAskBefore: nowPlusDays(days)}
        };

        await browser.storage.local.set({[SUBSCRIPTION_STORAGE_KEY]: updatedPreferences});
    }

    /**
     * Removes subscription preferences from extension storage.
     */
    clearStorage() {
        void browser.storage.local.remove(SUBSCRIPTION_STORAGE_KEY);
    }

    /**
     * Handles event-subscription-related messages from the renderer process.
     */
    async handleMessage(message: SubscriptionMessage) {
        switch (message.method) {
            case SubscriptionMessageMethod.WINDOW_CLOSE:
                void this.close();
                break;
            case SubscriptionMessageMethod.WINDOW_NOT_AGAIN:
                await this.updateDoNotAskBefore(this.currentWindow?.host ?? '', 365);
                void this.close();
                break;
            case SubscriptionMessageMethod.WINDOW_LATER:
                await this.updateDoNotAskBefore(this.currentWindow?.host ?? '', 1);
                void this.close();
                break;
            case SubscriptionMessageMethod.EVENTS_SUBSCRIBE:
                this.subscribe(message.payload ?? []);
                void this.close();
                break;
            default:
                console.error(
                    `[SubscriptionsController]: unknown message method "${JSON.stringify(message)}"`
                );
        }
    }
}

export default new SubscriptionsController();
