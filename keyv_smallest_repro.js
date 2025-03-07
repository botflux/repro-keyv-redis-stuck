import { createClient, createKeyv } from "@keyv/redis"
import { Cacheable } from "cacheable"
import { test } from "node:test"

test("should bypass the secondary store", async (t) => {
    const redis = createClient({
        url: "redis://localhost:17888",
        disableOfflineQueue: true,
    })

    redis.on("error", () => {})
    redis.connect().catch(() => {})

    while (!client.isOpen) {
        console.log("not open yet")
        await setTimeout(3_000)
    }

    const cacheable = new Cacheable({
        secondary: createKeyv(redis)
    })

    console.log("trying to get foo...")
    await cacheable.get("foo")
    console.log("disconnecting...")
    await cacheable.disconnect()
    console.log("disconnected")
})