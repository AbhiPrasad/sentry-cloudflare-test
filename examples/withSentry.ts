/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
export default withSentry({
	fetch: wrapFetch(async () => {
		const error = new Error('test');

		console.log('here');

		return new Response('hello');
	}),
} satisfies ExportedHandler<Env>);

function withSentry(handler: ExportedHandler<Env>) {
	if ('fetch' in handler && typeof handler.fetch === 'function' && !(handler.fetch as any).__SENTRY_INSTRUMENTED__) {
		handler.fetch = new Proxy(handler.fetch, {
			apply(target, thisArg, args: Parameters<typeof handler.fetch>) {
				console.log('fetch', target, thisArg, args);
				return target.apply(thisArg, args);
			},
		});
	}

	return handler;
}

function wrapFetch<E = Env, C = unknown>(handler: ExportedHandlerFetchHandler<E, C>) {
	const wrapper = (request: Request<C, IncomingRequestCfProperties<C>>, env: E, ctx: ExecutionContext) => {
		return handler(request, env, ctx);
	};
	wrapper.__SENTRY_INSTRUMENTED__ = false;

	return wrapper;
}
