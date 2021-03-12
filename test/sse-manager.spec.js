import SSEManager from '../src/sse-manager';

describe('SSEManager', () => {
  it('creates a client that inherits from manager config', () => {
    const $sse = new SSEManager({
      url: 'foo.local',
      withCredentials: true,
    });

    const client = $sse.create({});

    expect(client.url).toEqual('foo.local');
    expect(client.withCredentials).toEqual(true);
  });

  it('creates a client that overrides manager config', () => {
    const $sse = new SSEManager({
      url: 'foo.local',
      withCredentials: true,
    });

    const client = $sse.create({
      url: 'bar.local',
      withCredentials: false,
    });

    expect(client.url).toEqual('bar.local');
    expect(client.withCredentials).toEqual(false);
  });

  it('creates a client from url string not config object', () => {
    const $sse = new SSEManager();

    const client = $sse.create('foo.local');

    expect(client.url).toEqual('foo.local');
  });
});
