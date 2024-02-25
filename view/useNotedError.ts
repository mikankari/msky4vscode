import { useSyncExternalStore } from "react";
import { EmittingEvents } from "../src/ViewProvider";

export function useNotedError() {
    return useSyncExternalStore(subscribe, getSnapshot);
}

let notedError: EmittingEvents['noted-error']['message'] | undefined;

type Event = MessageEvent<{ eventType: keyof EmittingEvents, message: unknown }>;
type NotedErrorEvent = MessageEvent<{ eventType: 'noted-error', message: EmittingEvents['noted-error']['message'] }>;

function subscribe(callback: () => void): () => void {
    const extentionMessageListener = (event: Event): void => {
        if (((event: Event): event is NotedErrorEvent => event.data.eventType === 'noted-error')(event)) {
            notedError = event.data.message;
            callback();
        } else if (event.data.eventType === 'noted') {
            notedError = undefined;
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
    return notedError;
}
