import { useSyncExternalStore } from "react";
import { EmittingEvents } from "../src/ViewProvider";

export function useTimelineError() {
    return useSyncExternalStore(subscribe, getSnapshot);
}

let timelineError: EmittingEvents['error']['message'] | undefined;

type Event = MessageEvent<{ eventType: keyof EmittingEvents, message: unknown }>;
type ErrorEvent = MessageEvent<{ eventType: 'error', message: EmittingEvents['error']['message'] }>;

function subscribe(callback: () => void): () => void {
    const extentionMessageListener = (event: Event): void => {
        if (((event: Event): event is ErrorEvent => event.data.eventType === 'error')(event)) {
            timelineError = event.data.message;
            callback();
        } else if (event.data.eventType === 'note') {
            timelineError = undefined;
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
    return timelineError;
}
