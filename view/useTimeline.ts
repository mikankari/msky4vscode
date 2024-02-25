import { useSyncExternalStore } from "react";
import { EmittingEvents } from "../src/ViewProvider";

export function useTimeline() {
    return useSyncExternalStore(subscribe, getSnapshot);
}

let timeline: EmittingEvents['note']['message'][] = [];

type Event = MessageEvent<{ eventType: keyof EmittingEvents, message: unknown }>;
type NoteEvent = MessageEvent<{ eventType: 'note', message: EmittingEvents['note']['message'] }>;

function subscribe(callback: () => void): () => void {
    const extentionMessageListener = (event: Event): void => {
        if (((event: Event): event is NoteEvent => event.data.eventType === 'note')(event)) {
            timeline = [event.data.message].concat(timeline).slice(0, 10000);
            callback();
        } else if (event.data.eventType === 'loggedout') {
            timeline = [];
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
    return timeline;
}
