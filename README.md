# VueSSE
[![GitHub issues](https://img.shields.io/github/issues/tserkov/vue-sse.svg)]()
[![license](https://img.shields.io/github/license/tserkov/vue-sse.svg)]()
[![Beerpay](https://img.shields.io/beerpay/tserkov/vue-sse.svg)](https://beerpay.io/tserkov/vue-sse)

VueSSE enables effortless use of [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) by providing a high-level interface to an underlying [EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource).

## Install
```bash
# npm
npm install --save vue-sse

# or yarn
yarn add vue-sse
```

## Usage
VueSSE can be invoked globally from the Vue object via `Vue.SSE(...)` or from within components via `this.$sse(...)`

All of the following are valid calls to instantiate a connection to a event stream server:
- `Vue.SSE('/your-events-endpoint')` from anywhere the global Vue object is accessible;
- `this.$sse('/your-events-endpoint')` from inside any component method/lifecycle hook;
- `Vue.SSE('/your-events-endpoint', { format: 'json' })` will automatically process incoming messages as JSON;
- `this.$sse('/your-events-endpoint', { withCredentials: true })` will set CORS on the request.

## Configuration
Currently, VueSSE accepts the following config options

| Command | Description | Default |
| --- | --- | --- |
| format | Specify pre-processing, if any, to perform on incoming messages. Currently, only a JSON formatter is available by specifying `"json"`.  Messages that fail formatting will emit an error. | `"plain"` |
| withCredentials | Indicates if CORS should be set to include credentials. | `false` |

## Methods
Once you've successfully connected to an events server, an object will be returned with the following methods:

| Name | Description |
| --- | --- |
| getSource() | Returns the underlying EventSource. |
| onError(_function_ handler) | Allows your application to handle any errors thrown, such as loss of server connection and format pre-processing errors. |
| subscribe(_string_ event, _function_ handler) | Adds an event-specific listener to the event stream.  The handler function receives the message as its argument, formatted if a format was specified. |
| unsubscribe(_string_ event) | Removes all event-specific listeners from the event stream. |
| close() | Closes the connection.  __Once closed, it cannot be re-opened!You will need to call `$sse` again.__ |

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
    this.$sse('/your-events-server', { format: 'json' }) // or { format: 'plain' }
      .then(sse => {
        // Store SSE object at a higher scope
        msgServer = sse;

        // Catch any errors (ie. lost connections, etc.)
        sse.onError(e => {
          console.error('lost connection; giving up!', e);

          // This is purely for example; EventSource will automatically
          // attempt to reconnect indefinitely, with no action needed
          // on your part to resubscribe to events once (if) reconnected
          sse.close();
        });

        // Listen for messages without a specified event
        sse.subscribe('', data => {
          console.warn('Received a message w/o an event!', data);
        });

        // Listen for messages based on their event (in this case, "chat")
        sse.subscribe('chat', (message) => {
          this.messages.push(message);
        });

        // Unsubscribes from event-less messages after 7 seconds
        setTimeout(() => {
          sse.unsubscribe('');

          console.log('Stopped listening to event-less messages!');
        }, 7000);

        // Unsubscribes from chat messages after 7 seconds
        setTimeout(() => {
          sse.unsubscribe('chat');

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
    msgServer.close();
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
        msgServer = await $sse('/your-events-server', { format: 'json' }); // omit for no format pre-processing

        // Catch any errors (ie. lost connections, etc.)
        sse.onError(e => {
          console.error('lost connection; giving up!', e);

          // This is purely for example; EventSource will automatically
          // attempt to reconnect indefinitely, with no action needed
          // on your part to resubscribe to events once (if) reconnected
          sse.close();
        });

        // Listen for messages without a specified event
        sse.subscribe('', data => {
          console.warn('Received a message w/o an event!', data);
        });

        // Listen for messages based on their event (in this case, "chat")
        sse.subscribe('chat', message => {
          this.messages.push(message);
        });

        // Unsubscribes from event-less messages after 7 seconds
        setTimeout(() => {
          sse.unsubscribe('');

          console.log('Stopped listening to event-less messages!');
        }, 7000);

        // Unsubscribes from chat messages after 7 seconds
        setTimeout(() => {
          sse.unsubscribe('chat');

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
    msgServer.close();
  },
};
</script>
```
