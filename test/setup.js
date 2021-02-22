import { EventSource } from 'mocksse';
import Vue from 'vue';
import VueSSE from '../src/index';

Object.defineProperty(global, 'window', {
  value: {
    EventSource,
  },
});

Vue.config.devtools = false;
Vue.config.productionTip = false;

Vue.use(VueSSE);
