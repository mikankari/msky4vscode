import { useSyncExternalStore } from "react";
import { EmittingEvents } from "../src/ViewProvider";

export function useLoggedInAccount() {
    return useSyncExternalStore(subscribe, getSnapshot);
}

let loggedInAccount: EmittingEvents['loggedin']['message'] | null | undefined;

type Event = MessageEvent<{ eventType: keyof EmittingEvents, message: unknown }>;
type LoggedinEvent = MessageEvent<{ eventType: 'loggedin', message: EmittingEvents['loggedin']['message'] }>;

function subscribe(callback: () => void): () => void {
    const extentionMessageListener = (event: Event): void => {
        if (((event: Event): event is LoggedinEvent => event.data.eventType === 'loggedin')(event)) {
            loggedInAccount = event.data.message;
            callback();
        } else if (event.data.eventType === 'loggedout') {
            loggedInAccount = null;
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
    return loggedInAccount;
}
