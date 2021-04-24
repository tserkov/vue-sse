# VueSSE
[![GitHub issues](https://img.shields.io/github/issues/tserkov/vue-sse.svg)]()
[![license](https://img.shields.io/github/license/tserkov/vue-sse.svg)]()
[![Beerpay](https://img.shields.io/beerpay/tserkov/vue-sse.svg)](https://beerpay.io/tserkov/vue-sse)

VueSSE enables effortless use of [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) by providing a high-level interface to an underlying [EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource).

## Install
```bash
# npm
npm install --save vue-sse

# yarn
yarn add vue-sse
```

```javascript
// in main.js
// using defaults
import VueSSE from 'vue-sse';
Vue.use(VueSSE);
```

```javascript
// in main.js
// using custom defaults
import VueSSE from 'vue-sse';

Vue.use(VueSSE, {
  format: 'json', // parse messages as JSON
  polyfill: true, // support older browsers
  url: 'http://my.api.com/sse', // default sse server url
  withCredentials: true, // send cookies
});
```

## Usage
VueSSE can be invoked globally from the Vue object via `Vue.$sse.create(...)` or from within components via `this.$sse.create(...)`

All of the following are valid calls to instantiate a connection to a event stream server:
- `Vue.$sse.create({ url: '/your-events-endpoint' })` from anywhere the global Vue object is accessible;
- `this.$sse.create({ url: '/your-events-endpoint' })` from inside any component method/lifecycle hook;
- `Vue.$sse.create({ url: '/your-events-endpoint', format: 'json' })` will automatically process incoming messages as JSON;
- `this.$sse.create({ url: '/your-events-endpoint', withCredentials: true })` will set CORS on the request.

## Configuration
VueSSE accepts the following config options when adding VueSSE via `Vue.use(...)` and when calling `$sse.create`.

| Option | Description | Default |
| --- | --- | --- |
| format: _ | Specify pre-processing, if any, to perform on incoming messages. Currently, only a JSON formatter is available by specifying `"json"`.  Messages that fail formatting will emit an error. | `"plain"` |
| polyfill | Include an EventSource polyfill for older browsers | `false` |
| url | The location of the SSE server | `""` |
| withCredentials | Indicates if CORS should be set to include credentials. | `false` |

## Methods
Once you've successfully connected to an events server, an object will be returned with the following methods:

| Name | Description |
| --- | --- |
| connect(): _Promise<SSEClient>_ | 
| source | Returns the underlying EventSource. |
| on('error', _function_ handler): _SSEClient_ | Allows your application to handle any errors thrown, such as loss of server connection and format pre-processing errors. |
| on(_string_ event, _function_ handler): _SSEClient_ | Adds an event-specific listener to the event stream.  The handler function receives the message as its argument (formatted if a format was specified), and the original underlying Event. |
| once(_string_ event, _function_ handler): _SSEClient_ | Same as on, but only triggered once. |
| off(_string_ event): _SSEClient_ | Removes all event-specific listeners from the event stream. |
| disconnect() | Closes the connection. |

## Examples

### Promises
```html
<template>
  <div>
    <p v-for="message in messages">{{ message }}</p>
  </div>
</template>

<script>
// We store the reference to the SSE object out here
// so we can access it from other methods
let msgServer;

export default {
  name: 'sse-test',
  data() {
    return {
      messages: [],
    };
  },
  mounted() {
    this.$sse.create({url: '/your-events-server', format: 'json' }) // or { format: 'plain' }
      .connect()
      .then(sse => {
        // Store SSE object at a higher scope
        msgServer = sse;

        // Catch any errors (ie. lost connections, etc.)
        sse.on('error', (e) => {
          console.error('lost connection; giving up!', e);

          // This is purely for example; EventSource will automatically
          // attempt to reconnect indefinitely, with no action needed
          // on your part to resubscribe to events once (if) reconnected
          sse.disconnect();
        });

        // Listen for messages without a specified event
        sse.on('', (message, rawEvent) => {
          console.warn('Received a message w/o an event!', message);
        });

        // Listen for messages based on their event (in this case, "chat")
        sse.on('chat', (message, rawEvent) => {
          this.messages.push(message);
        });

        // Unsubscribes from event-less messages after 7 seconds
        setTimeout(() => {
          sse.off('');

          console.log('Stopped listening to event-less messages!');
        }, 7000);

        // Unsubscribes from chat messages after 7 seconds
        setTimeout(() => {
          sse.off('chat');

          console.log('Stopped listening to chat messages!');
        }, 14000);
      })
      .catch(err => {
        // When this error is caught, it means the initial connection to the
        // events server failed.  No automatic attempts to reconnect will be made.
        console.error('Failed to connect to server', err);
      });
  },
  beforeDestroy() {
    // Make sure to close the connection with the events server
    // when the component is destroyed, or we'll have ghost connections!
    msgServer.disconnect();
  },
};
</script>
```

### Async/Await

```html
<template>
  <div>
    <p v-for="message in messages">{{ message }}</p>
  </div>
</template>

<script>
// We store the reference to the SSE object out here
// so we can access it from other methods
let msgServer;

export default {
  name: 'sse-test',
  data() {
    return {
      messages: [],
    };
  },
  mounted() {
    (async () => {
      try {
        // Store SSE object at a higher scope
        msgServer = await $sse.create({url: '/your-events-server', format: 'json' }); // omit for no format pre-processing
        msgServer.connect();
  
        // Catch any errors (ie. lost connections, etc.)
        msgServer.on('error', (e) => {
          console.error('lost connection; giving up!', e);

          // If you don't want SSE to automatically reconnect (if possible),
          // then uncomment the following line:
          // msgServer.disconnect();
        });

        // Listen for messages without a specified event
        msgServer.on('', (data, rawEvent) => {
          console.warn('Received a message w/o an event!', data);
        });

        // Listen for messages based on their event (in this case, "chat")
        msgServer.on('chat', (message, rawEvent) => {
          this.messages.push(message);
        });

        // Unsubscribes from event-less messages after 7 seconds
        setTimeout(() => {
          msgServer.off('');

          console.log('Stopped listening to event-less messages!');
        }, 7000);

        // Unsubscribes from chat messages after 7 seconds
        setTimeout(() => {
          msgServer.off('chat');

          console.log('Stopped listening to chat messages');
        }, 14000);
      } catch (err) {
        // When this error is caught, it means the initial connection to the
        // events server failed.  No automatic attempts to reconnect will be made.
        console.error('Failed to connect to server', err);
      }
    })();
  },
  beforeDestroy() {
    // Make sure to close the connection with the events server
    // when the component is destroyed, or we'll have ghost connections!
    msgServer.disconnect();
  },
};
</script>
```
