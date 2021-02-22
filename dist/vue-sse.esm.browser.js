/*!
 * vue-sse v1.1.1
 * (c) 2021 James Churchard
 * @license ISC
 */
class Client {
  constructor(url) {
    // eslint-disable-next-line no-console
    console.log('Client::constructor', url);
    this.url = url;
  }

  connect() {
    this.url = 'connect';
  }

  close() {
    this.url = 'close';
  }
}

function install(Vue) {
  // eslint-disable-next-line no-console
  console.log('Installing Manager');
  // eslint-disable-next-line no-param-reassign, no-multi-assign
  Vue.$sse = Vue.prototype.$sse = VueSSE;
}

const Manager = {
  create(config) {
    // eslint-disable-next-line no-console
    console.log('Manager::create', config);

    return new Client(config.url);
  },
};

var index = {
  Manager,
  install,
};

export default index;
export { Manager, install };
