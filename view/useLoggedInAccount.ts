import { useSyncExternalStore } from "react";

export function useLoggedInAccount() {
    return useSyncExternalStore(subscribe, getSnapshot);
}

let loggedInAccount;

function subscribe(callback) {
    const extentionMessageListener = (event: MessageEvent): void => {
        switch (event.data.eventType) {
            case 'loggedin':
                loggedInAccount = event.data.message;
                break;
            case 'loggedout':
                loggedInAccount = undefined;
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
    return loggedInAccount;
}
