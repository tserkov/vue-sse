import Vue from 'vue';
import VueSSE from './index';

declare module 'vue/types/vue' {
  interface VueConstructor {
    $sse: any;
  }

  interface Vue {
    $sse: any;
  }
}
