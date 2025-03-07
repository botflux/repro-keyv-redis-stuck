import { fastify } from "fastify"
import { Cacheable } from "cacheable"
import { createClient, createKeyv } from "@keyv/redis"
import fastifyPlugin from "fastify-plugin"
import { setTimeout } from "node:timers/promises"

const cacheablePlugin = fastifyPlugin((instance, { uri }, done) => {
    instance
        .decorate("cacheable", undefined)
        .addHook("onReady", async function () {
            this.log.info("onReady cacheable plugin")
            const redis = createClient({
                url: uri,
                disableOfflineQueue: true,
                commandsQueueMaxLength: 0,  
            })

            redis.on("error", () => {})
            redis.connect().catch(() => {})

            while (!redis.isOpen) {
                await setTimeout(10)
            }

            this.cacheable = new Cacheable({
                namespace: "my-namespace",
                secondary: createKeyv(redis),
                nonBlocking: true
            })
        })
        .addHook("preClose", async function () {
            this.log.info("preClose cacheable plugin")
            await this.cacheable.disconnect()
        })
        // .addHook("onClose", async function () {
        //     this.log.info("onClose cacheable plugin")
        //     await this.cacheable.disconnect()
        // })

        done()
})

export function createApp () {

    const app = fastify({
        logger: true,
        requestTimeout: 2_000
    })

    app
        .register(cacheablePlugin, { uri: "redis://localhost:7777" })
        .route({
            url: "/",
            method: "GET",
            handler: async (request, reply) => {
                request.log.info("calling cache.get")

                // setTimeout(() => {
                //     request.server.cacheable.secondary.store.client.disconnect()
                //         .then(() => console.log("disconnected"))
                //         .catch(console.error)
                // }, 3_000)

                await request.server.cacheable.get("foo")
                request.log.info("cache.get ended")
                return {msg: "hello world"}
            }
        })

        return app
}
