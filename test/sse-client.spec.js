import { MockEvent } from 'mocksse';
import SSEClient from '../src/sse-client';

describe('SSEClient', () => {
  it('can receive eventless text messages', (done) => {
    new MockEvent({
      url: '/eventless-text',
      responses: [{
        type: 'message',
        data: 'a short message',
      }],
    });

    const client = new SSEClient({
      url: '/eventless-text',
      format: 'plain',
      handlers: {
        message: (msg) => {
          try {
            expect(msg).toEqual('a short message');
            done();
          } catch (err) {
            done(err);
          } finally {
            client.disconnect();
          }
        },
      },
    });

    client.connect();
  });

  it('can receive eventless json messages', (done) => {
    new MockEvent({
      url: '/eventless-json',
      responses: [{
        type: 'message',
        data: '{"pi":3.14}',
      }],
    });

    const client = new SSEClient({
      url: '/eventless-json',
      format: 'json',
      handlers: {
        message: (msg) => {
          try {
            expect(msg).toStrictEqual({ pi: 3.14 });
            done();
          } catch (err) {
            done(err);
          } finally {
            client.disconnect();
          }
        },
      },
    });

    client.connect();
  });

  it('can receive custom event messages', (done) => {
    new MockEvent({
      url: '/custom-event',
      responses: [{
        type: 'ping',
        data: 'ok!',
      }],
    });

    const client = new SSEClient({
      url: '/custom-event',
      handlers: {
        ping: (msg) => {
          try {
            expect(msg).toStrictEqual('ok!');
            done();
          } catch (err) {
            done(err);
          } finally {
            client.disconnect();
          }
        },
      },
    });

    client.connect();
  });
});
