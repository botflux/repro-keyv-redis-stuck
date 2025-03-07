# `keyv-redis-reconnection-loop-issue`

This reproduction shows what I think is a bug in the redis keyv package.

## Bug

The keyv adapter is stuck if the redis client never achieve to 
connect once, even if cacheable has `nonBlocking: true`, and 
redis client has `disableOfflineQueue: true`.

## Reproduction

Create a cacheable instance with a keyv redis with an URL 
pointing to nothing.
In this case, the redis client will be stuck in a reconnection loop.

You can find the reproduction test in [`keyv_repro.js`](./keyv_repro.js)

```
npm run test-repro
```

## Workaround

The workaround is to pass a redis client on which the `connect` method is already called.
The promise returned by `connect` must be ignored in order to 
not block the execution.

By doing so, the client is in open state, so the keyv adapter 
won't call `connect` itself, and get stuck.

The workaround can by found in [`keyv_workaround.js`](./keyv_workaround.js)

```
npm run test-workaround
```

## Details on the bug

The keyv adapter's `get` method obtains its client by calling
[`getClient()`](https://github.com/jaredwray/keyv/blob/cbfd3465c32aa2f01e0c5c06b5a9106c7e969a33/packages/redis/src/index.ts#L220) which connect the client if its not opened.

```typescript
/**
* Get the Redis URL used to connect to the server. This is used to get a connected client.
*/
public async getClient(): Promise<RedisClientConnectionType> {
    if (!this._client.isOpen) {
        await this._client.connect();
    }

    return this._client;
}
```

The catch is that the `connect` method on the redis client will
try to connect forever until it is connected.

Here is the [`#connect()`](https://github.com/redis/node-redis/blob/8b4ed0059aabc26bde8cc228459be18836cd6f65/packages/client/lib/client/socket.ts#L200C3-L227C4) method called by [`connect()`](https://github.com/redis/node-redis/blob/8b4ed0059aabc26bde8cc228459be18836cd6f65/packages/client/lib/client/socket.ts#L191).

```typescript
async #connect(): Promise<void> {
    let retries = 0;
    do {
      try {
        this.#socket = await this.#createSocket();
        this.emit('connect');

        try {
          await this.#initiator();
        } catch (err) {
          this.#socket.destroy();
          this.#socket = undefined;
          throw err;
        }
        this.#isReady = true;
        this.emit('ready');
      } catch (err) {
        const retryIn = this.#shouldReconnect(retries++, err as Error);
        if (typeof retryIn !== 'number') {
          throw retryIn;
        }

        this.emit('error', err);
        await setTimeout(retryIn);
        this.emit('reconnecting');
      }
    } while (this.#isOpen && !this.#isReady);
  }
```

> You can disable this behavior by disabling retry,
> but it means that the redis client won't recover from
> a redis failure.
> 
> ```
> const redis = createClient({
>   url: "redis://localhost:17888",
>   socket: {
>     reconnectStrategy: false
>   }
> })
> ```