/**
 * A mixin that adds support for event emitting
 */
export default class EventEmitter {
    private listeners;
    /**
     * Adds an event listener for the given event
     */
    on(name: string, handler: Function): {
        destroy: () => void;
    };
    /**
     * Removes an event listener for the given event
     */
    off(name: string, handler: Function): void;
    /**
     * Raises the given event
     */
    raiseEvent(name: string, ...args: any[]): void;
}
