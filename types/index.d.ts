import './vue';
import Vue from 'vue';

export type MessageFormatter<T> = (event: MessageEvent) => T;

export type MessageHandler = (data: any, lastEventId: string) => void;

export interface SSEConfig {
	format?: 'plain' | 'json' | MessageFormatter<any>;
	handlers?: Partial<Record<string, MessageHandler>>;
	polyfill?: boolean;
	forcePolyfill?: boolean;
	polyfillOptions?: object;
	url?: string;
	withCredentials?: boolean;
}

export interface SSEComponentOptions {
	cleanup?: boolean;
}

export declare class SSEManager {
	$defaultConfig: SSEConfig;
	$clients: SSEClient[] | null;

	constructor(config?: SSEConfig);
	create(configOrURL?: SSEConfig | string): SSEClient;
}

export declare class SSEClient {
	url: string;
	withCredentials: boolean;

	_format: MessageFormatter<any>;
	_handlers: Partial<Record<string, MessageHandler[]>>;
	_listeners: Partial<Record<string, EventListener>>;
	_source: EventSource;

	constructor(config?: SSEConfig);
	connect(): Promise<SSEClient>;
	disconnect(): void;
	on(event: string, handler: MessageHandler): SSEClient;
	once(event: string, handler: MessageHandler): SSEClient;
	off(event: string, handler: MessageHandler): SSEClient;

	get source(): EventSource;
}

export declare function install(vue: typeof Vue, config?: SSEConfig): void;

declare const _default: {
	SSEClient: typeof SSEClient;
	SSEManager: typeof SSEManager;
	install: typeof install;
}
export default _default;
