import SSEClient, { formatText } from './sse-client';

export function install(Vue, config) {
  // eslint-disable-next-line no-param-reassign, no-multi-assign
  Vue.$sse = Vue.prototype.$sse = new SSEManager(config);

  if (config && config.polyfill) {
    import('event-source-polyfill');
  }

  // This mixin allows components to specify that all clients that were
  // created within it should be automatically disconnected (cleanup)
  // when the component is destroyed.
  Vue.mixin({
    beforeCreate() {
      if (this.$options.sse && this.$options.sse.cleanup) {
        // We instantiate an SSEManager for this specific instance
        // in order to track it (see discussions in #13 for rationale).
        this.$sse = new SSEManager();

        // We also set $clients to an empty array, as opposed to null,
        // so that beforeDestroy and create know to use it.
        this.$sse.$clients = [];
      }
    },
    beforeDestroy() {
      if (this.$sse.$clients !== null) {
        this.$sse.$clients.forEach(c => c.disconnect());
        this.$sse.$clients = [];
      }
    }
  });
}

export class SSEManager {
  constructor(config) {
    this.$defaultConfig = Object.assign(
      {
        format: formatText,
        sendCredentials: false,
      },
      config,
    );

    this.$clients = null;
  }

  create(configOrURL) {
    let config;
    if (typeof configOrURL === 'object') {
      config = configOrURL;
    } else if (typeof configOrURL === 'string') {
      config = {
        url: configOrURL,
      };
    } else {
      config = {};
    }

    const client = new SSEClient(Object.assign({}, this.$defaultConfig, config));

    // If $clients is not null, then it's array that we should push this
    // client into for later cleanup in our mixin's beforeDestroy.
    if (this.$clients !== null) {
      this.$clients.push(client);
    }

    return client;
  }
}

export default SSEManager;
