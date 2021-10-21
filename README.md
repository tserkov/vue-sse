# VueSSE
[![GitHub issues](https://img.shields.io/github/issues/tserkov/vue-sse.svg)]()
[![license](https://img.shields.io/github/license/tserkov/vue-sse.svg)]()

VueSSE enables effortless use of [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) by providing a high-level interface to an underlying [EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource).

## Install
```bash
# npm
npm install --save vue-sse

# OR yarn
yarn add vue-sse
```

```javascript
// in main.js
import VueSSE from 'vue-sse';

// using defaults
Vue.use(VueSSE);

// OR specify custom defaults (described below)
Vue.use(VueSSE, {
  format: 'json',
  polyfill: true,
  url: '/my-events-server',
  withCredentials: true,
});
```

## Quickstart
```js
this.$sse.create('/my-events-server')
  .on('message', (msg) => console.info('Message:', msg))
  .on('error', (err) => console.error('Failed to parse or lost connection:', err))
  .connect()
  .catch((err) => console.error('Failed make initial connection:', err));
```

## Usage
Clients can be created from the Vue object via `Vue.$sse.create(...)` or from within components via `this.$sse.create(...)`

All of the following are valid calls to create a client:
- `this.$sse.create('/your-events-endpoint')` to connect to the specified URL without specifying any config
- `this.$sse.create({ url: '/your-events-endpoint', format: 'json' })` will automatically parse incoming messages as JSON
- `this.$sse.create({ url: '/your-events-endpoint', withCredentials: true })` will set CORS on the request

Once you've created a client, you can add handlers before or after calling `connect()`, which must be called.

## Configuration
`$sse.create` accepts the following config options when installing VueSSE via `Vue.use` and when calling `$sse.create`.

| Option | Type | Description | Default |
| --- | --- | --- | -- |
| format | `"plain"` \| `"json"` \| `(event: MessageEvent) => any` | Specify pre-processing, if any, to perform on incoming messages. Messages that fail formatting will emit an error. | `"plain"` |
| url | `string` | The location of the SSE server. | `""` |
| withCredentials | `boolean` | Indicates if CORS should be set to include credentials. | `false` |
| polyfill | `boolean` | Include an [EventSource polyfill](https://github.com/Yaffle/EventSource) for older browsers. | `false` |
| forcePolyfill | `boolean` | Forces the [EventSource polyfill](https://github.com/Yaffle/EventSource) to always be used over native. | `false` |
| polyfillOptions | `object` | Custom options to provide to the [EventSource polyfill](https://github.com/Yaffle/EventSource#custom-headers). Only used if `forcePolyfill` is true. | `null` |

If `$sse.create` is called with a string, it must be the URL to the SSE server.

## Methods
Once you've successfully connected to an events server, a client will be returned with the following methods:

| Name | Description |
| --- | --- |
| __connect__(): _Promise<SSEClient>_ | Connects to the server. __Must be called.__ |
| __on__(event: _string_, (data: _any_) => _void_): _SSEClient_ | Adds an event-specific listener to the event stream.  The handler function receives the message as its argument (formatted if a format was specified), and the original underlying Event. For non-event messages, specify `""` or `"message"` as the event. |
| __once__(event: _string_, (data: _any_) => _void_): _SSEClient_ | Same as `on(...)`, but only triggered once. |
| __off__(event: _string_, (data: _any_ => _void_)): _SSEClient_ | Removes the given handler from the event stream. The function must be the same as provided to `on`/`once`. |
| __on__('error', (err) => void): _SSEClient_ | Allows your application to handle any errors thrown, such as loss of server connection and pre-processing errors. |
| __disconnect__(): _void_ | Closes the connection. The client can be re-used by calling `connect()`. __Must be called!__ (Usually, in the `beforeDestroy` of your component.) |

## Properties
| Name | Type | Description |
| --- | --- | --- |
| source | `EventSource` | Returns the underlying EventSource. |

## Cleanup
Every connection must be disconnected when the component is destroyed. There are two ways to achieve this:
1. Call `disconnect()` on the client during `beforeDestroy`, or
2. Add the following option to your component to have them automatically closed for you during `beforeDestroy`:
```js
export default {
    name: 'my-component',
    data() { /* ... */ },
    // ...
    sse: {
        cleanup: true,
    },
    // ...
}
```

## Vue 3
This plugin works the same in both Vue 2 and 3. The Composition API is not yet supported.

## Example
An example project is provided at [tserkov/vue-sse-example](https://github.com/tserkov/vue-sse-example).

### Kitchen Sink
```html
<template>
  <div>
    <p
      v-for="(message, idx) in messages"
      :key="idx"
    >{{ message }}</p>
  </div>
</template>

<script>
// We store the reference to the SSE client out here
// so we can access it from other methods
let sseClient;

export default {
  name: 'sse-test',
  data() {
    return {
      messages: [],
    };
  },
  mounted() {
    sseClient = this.$sse.create({
      url: '/your-events-server',
      format: 'json',
      withCredentials: true,
      polyfill: true,
    });

    // Catch any errors (ie. lost connections, etc.)
    sseClient.on('error', (e) => {
      console.error('lost connection or failed to parse!', e);

      // If this error is due to an unexpected disconnection, EventSource will
      // automatically attempt to reconnect indefinitely. You will _not_ need to
      // re-add your handlers.
    });

    // Handle messages without a specific event
    sseClient.on('message', this.handleMessage);

    // Handle 'chat' messages
    sseClient.on('chat', this.handleChat);

    // Handle once for a ban message
    sseClient.once('ban', this.handleBan);

    sseClient.connect()
      .then(sse => {
        console.log('We\'re connected!');

        // Unsubscribes from event-less messages after 7 seconds
        setTimeout(() => {
          sseClient.off('message', this.handleMessage);
          console.log('Stopped listening to event-less messages!');
        }, 7000);

        // Unsubscribes from chat messages after 14 seconds
        setTimeout(() => {
          sse.off('chat', this.handleChat);
          console.log('Stopped listening to chat messages!');
        }, 14000);
      })
      .catch((err) => {
        // When this error is caught, it means the initial connection to the
        // events server failed.  No automatic attempts to reconnect will be made.
        console.error('Failed to connect to server', err);
      });
  },
  methods: {
    handleBan(banMessage) {
      // Note that we can access properties of message, since our parser is set to JSON
      // and the hypothetical object has a `reason` property.
      this.messages.push(`You've been banned! Reason: ${banMessage.reason}`);
    },
    handleChat(message) {
      // Note that we can access properties of message, since our parser is set to JSON
      // and the hypothetical object has these properties.
      this.messages.push(`${message.user} said: ${message.text}`);
    },
    handleMessage(message, lastEventId) {
      console.warn('Received a message w/o an event!', message, lastEventId);
    },
  },
  beforeDestroy() {
    // Make sure to close the connection with the events server
    // when the component is destroyed, or we'll have ghost connections!
    sseClient.disconnect();

    // Alternatively, we could have added the `sse: { cleanup: true }` option to our component,
    // and the SSEManager would have automatically disconnected during beforeDestroy.
  },
};
</script>
```
