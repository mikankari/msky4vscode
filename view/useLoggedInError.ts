import { useSyncExternalStore } from "react";
import { EmittingEvents } from "../src/ViewProvider";

export function useLoggedInError() {
    return useSyncExternalStore(subscribe, getSnapshot);
}

let loggedInError: EmittingEvents['loggedin-error']['message'] | undefined;

type Event = MessageEvent<{ eventType: keyof EmittingEvents, message: unknown }>;
type LoggedinErrorEvent = MessageEvent<{ eventType: 'loggedin-error', message: EmittingEvents['loggedin-error']['message'] }>;

function subscribe(callback: () => void): () => void {
    const extentionMessageListener = (event: Event): void => {
        if (((event: Event): event is LoggedinErrorEvent => event.data.eventType === 'loggedin-error')(event)) {
            loggedInError = event.data.message;
            callback();
        } else if (event.data.eventType === 'loggedin') {
            loggedInError = undefined;
            callback();
        }
    };
    window.addEventListener('message', extentionMessageListener);
    // unsubscribe
    return () => {
        window.removeEventListener('message', extentionMessageListener);
    };
}

function getSnapshot() {
    return loggedInError;
}
