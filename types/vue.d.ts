import Vue from 'vue';
import { SSEManager } from './index';

declare module 'vue/types/vue' {
  interface VueConstructor {
    readonly $sse: SSEManager;
  }

  interface Vue {
    $sse: SSEManager;
  }
}
