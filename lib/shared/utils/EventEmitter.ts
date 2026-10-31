import type { CaughtError } from "./CaughtError";

export type EventMap = {
  [key: string]: unknown;
};

export type EventListener<Data> = (data: Data) => void;

export class EventEmitter<Events extends EventMap> {
  #listenerMap: {
    [Key in keyof Events]?: EventListener<Events[Key]>[];
  } = {};

  addListener<Type extends keyof Events>(
    type: Type,
    listener: EventListener<Events[Type]>
  ) {
    const listeners = this.#listenerMap[type];
    if (listeners === undefined) {
      this.#listenerMap[type] = [listener];
    } else {
      if (!listeners.includes(listener)) {
        listeners.push(listener);
      }
    }

    return () => {
      this.removeListener(type, listener);
    };
  }

  emit<Type extends keyof Events>(type: Type, data: Events[Type]) {
    const listeners = this.#listenerMap[type];
    if (listeners !== undefined) {
      if (listeners.length === 1) {
        // There are no other listeners to protect, so an error can be thrown immediately
        // (this also avoids cloning the listeners array in the common case)
        const listener = listeners[0];
        listener.call(null, data);
        return;
      }

      // Listeners may throw; defer errors so that every listener is still called
      let caughtError: CaughtError | undefined;

      // Clone the current listeners before calling
      // in case calling triggers listeners to be added or removed
      const clonedListeners = Array.from(listeners);
      for (let i = 0; i < clonedListeners.length; i++) {
        const listener = clonedListeners[i];
        try {
          listener.call(null, data);
        } catch (error) {
          caughtError ??= { error };
        }
      }

      if (caughtError) {
        throw caughtError.error;
      }
    }
  }

  removeAllListeners() {
    this.#listenerMap = {};
  }

  removeListener<Type extends keyof Events>(
    type: Type,
    listener: EventListener<Events[Type]>
  ) {
    const listeners = this.#listenerMap[type];
    if (listeners !== undefined) {
      const index = listeners.indexOf(listener);
      if (index >= 0) {
        listeners.splice(index, 1);
      }
    }
  }
}
