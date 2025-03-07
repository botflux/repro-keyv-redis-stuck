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
won't call `connect` itself.

The workaround can by found in [`keyv_workaround.js`](./keyv_workaround.js)

```
npm run test-workaround
```