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
        const listener = listeners[0];
        listener.call(null, data);
      } else {
        let didThrow = false;
        let caughtError = null;

        // Clone the current listeners before calling
        // in case calling triggers listeners to be added or removed
        const clonedListeners = Array.from(listeners);
        for (let i = 0; i < clonedListeners.length; i++) {
          const listener = clonedListeners[i];
          try {
            listener.call(null, data);
          } catch (error) {
            if (caughtError === null) {
              didThrow = true;
              caughtError = error;
            }
          }
        }

        if (didThrow) {
          throw caughtError;
        }
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
