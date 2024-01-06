import { useSyncExternalStore } from "react";

export function useTimeline() {
    return useSyncExternalStore(subscribe, getSnapshot);
}

let timeline: any[] = [];

function subscribe(callback) {
    const extentionMessageListener = (event: MessageEvent): void => {
        switch (event.data.eventType) {
            case 'note':
                timeline = [event.data.message].concat(timeline).slice(0, 100);
                break;
            case 'loggedout':
                timeline = [];
                break;
        }
        callback();
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
