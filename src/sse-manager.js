import SSEClient, { formatText } from './sse-client';

export function install(Vue, config) {
  // eslint-disable-next-line no-param-reassign, no-multi-assign
  Vue.$sse = Vue.prototype.$sse = new SSEManager(config);

  if (config && config.polyfill) {
    import('event-source-polyfill');
  }
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
  }

  create(config) {
    return new SSEClient(Object.assign({}, this.$defaultConfig, config));
  }
}

export default SSEManager;
