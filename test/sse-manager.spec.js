import { createLocalVue, mount } from '@vue/test-utils';
import SSEManager from '../src/sse-manager';
import VueSSE from '../src/index';

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

  it('creates a client and cleans up', () => {
    const localVue = createLocalVue()
    localVue.use(VueSSE);

    const wrapper = mount({
      template: '<div></div>',
      sse: {
        cleanup: true,
      },
      mounted() {
        this.$sse.create('bar.local');
      },
    }, { localVue });

    wrapper.destroy();

    expect(wrapper.vm.$sse.$clients).not.toBe(null);
    expect(wrapper.vm.$sse.$clients).toHaveLength(0);
  });

  it('creates a client and does not clean up', () => {
    const localVue = createLocalVue()
    localVue.use(VueSSE);

    const wrapper = mount({
      template: '<div></div>',
      sse: {
        cleanup: false,
      },
      mounted() {
        this.$sse.create('bar.local');
      },
    }, { localVue });

    wrapper.destroy();

    expect(wrapper.vm.$sse.$clients).toBe(null);
  });
});
