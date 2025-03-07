import { createClient, createKeyv } from "@keyv/redis"
import { Cacheable } from "cacheable"
import { test } from "node:test"
import { setTimeout } from "node:timers/promises"

test("should bypass the secondary store", async (t) => {
    const redis = createClient({
        url: "redis://localhost:17888",
        disableOfflineQueue: true,
    })

    redis.on("error", () => {})
    redis.connect().catch(() => {})

    if (!redis.isOpen) {
        console.log("not opened yet")
        await setTimeout(50)
    }

    const cacheable = new Cacheable({
        nonBlocking: true,
        secondary: createKeyv(redis)
    })

    console.log("trying to get foo...")
    await cacheable.get("foo")
    console.log("disconnecting...")
    await cacheable.disconnect()
    console.log("disconnected")
})