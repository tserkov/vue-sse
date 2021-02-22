/*!
 * vue-sse v1.1.1
 * (c) 2021 James Churchard
 * @license ISC
 */
'use strict';

var Client = function Client(url) {
  // eslint-disable-next-line no-console
  console.log('Client::constructor', url);
  this.url = url;
};

Client.prototype.connect = function connect () {
  this.url = 'connect';
};

Client.prototype.close = function close () {
  this.url = 'close';
};

function install(Vue) {
  // eslint-disable-next-line no-console
  console.log('Installing Manager');
  // eslint-disable-next-line no-param-reassign, no-multi-assign
  Vue.$sse = Vue.prototype.$sse = VueSSE;
}

var Manager = {
  create: function create(config) {
    // eslint-disable-next-line no-console
    console.log('Manager::create', config);

    return new Client(config.url);
  },
};

var index_cjs = {
  Manager: Manager,
  install: install,
};

module.exports = index_cjs;
