export const formatText = (e) => e.data;

export const formatJSON = (e) => JSON.parse(e.data);

export default class SSEClient {
  constructor(config) {
    this._handlers = config.handlers || {};
    this._listeners = {};
    this._source = null;

    if (config.format) {
      if (typeof config.format === 'string') {
        if (config.format === 'plain') {
          this._format = formatText;
        } else if (config.format === 'json') {
          this._format = formatJSON;
        } else {
          this._format = formatText;
        }
      } else if (typeof config.format === 'function') {
        this._format = config.format;
      } else {
        this._format = formatText;
      }
    } else {
      this._format = formatText;
    }

    this.url = config.url;
    this.withCredentials = !!config.withCredentials;
  }

  get source() {
    return this._source;
  }

  connect() {
    this._source = new window.EventSource(this.url, {
      withCredentials: this.withCredentials,
    });

    return new Promise((resolve, reject) => {
      this._source.onopen = () => {
        // Add event listeners/handlers that were
        // provided at config-time.
        for (let event in this._handlers) {
          this.on(event, this._handlers[event]);
        }

        this._source.onerror = null;

        resolve(this);
      };

      this._source.onerror = reject;
    });
  }

  disconnect() {
    if (this._source !== null) {
      this._source.close();
      this._source = null;
    }
  }

  on(event, handler) {
    if (!event) {
      // Default "event-less" event
      event = 'message';
    }

    if (!this._listeners[event]) {
      this._create(event);
    }

    this._handlers[event].push(handler);

    return this;
  }

  once(event, handler) {
    this.on(event, (e) => {
      this.off(event, handler);

      handler(e);
    });

    return this;
  }

  off(event, handler) {
    if (!this._handlers[event]) {
      // no handlers registered for event
      return this;
    }

    const idx = this._handlers[event].indexOf(handler);
    if (idx === -1) {
      // handler not registered for event
      return this;
    }

    // remove handler from event
    this._handlers[event].splice(idx, 1);

    if (this._handlers[event].length === 0) {
      // remove listener since no handlers exist
      this._source.removeEventListener(event, this._listeners[event]);
      delete this._handlers[event];
      delete this._listeners[event];
    }

    return this;
  }

  _create(event) {
    this._handlers[event] = [];

    this._listeners[event] = (message) => {
      let data;

      try {
        data = this._format(message);
      } catch (err) {
        if (typeof this._source.onerror === 'function') {
          this._source.onerror(err);
        }
        return;
      }

      for (let handler of this._handlers[event]) {
        handler(data);
      }
    };

    this._source.addEventListener(event, this._listeners[event]);
  }
}
