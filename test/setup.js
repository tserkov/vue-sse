import { EventSource } from 'mocksse';

Object.defineProperty(global, 'window', {
  value: {
    EventSource,
    navigator: {
      userAgent: 'jest',
    },
  },
});
