import Vue from 'vue';
import { SSEComponentOptions, SSEManager } from './index';

declare module 'vue/types/vue' {
  interface VueConstructor {
    readonly $sse: SSEManager;
  }

  interface Vue {
    $sse: SSEManager;
  }
}

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    sse?: SSEComponentOptions;
  }
}
