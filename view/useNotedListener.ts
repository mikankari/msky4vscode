import { useEffect } from "react";
import { EmittingEvents } from "../src/ViewProvider";

type Event = MessageEvent<{ eventType: keyof EmittingEvents, message: unknown }>;

export function useNotedListener(callback: () => void): void {
    useEffect(() => {
        const extentionMessageListener = (event: Event): void => {
             if (event.data.eventType === 'noted') {
                callback();
            }
        };
        window.addEventListener('message', extentionMessageListener);
        // unsubscribe
        return () => {
            window.removeEventListener('message', extentionMessageListener);
        };
    }, [callback]);
}
