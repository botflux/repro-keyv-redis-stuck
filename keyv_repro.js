import { createKeyv } from "@keyv/redis"
import { Cacheable } from "cacheable"
import { test } from "node:test"

test("should not be blocked by get() when redis is unavailable even on the first connection", async (t) => {
    const cacheable = new Cacheable({
        secondary: createKeyv({
            // This redis instance does not exist
            url: "redis://localhost:17888",
            disableOfflineQueue: true
        }),
        nonBlocking: true
    })

    console.log("trying to get foo...")
    await cacheable.get("foo")
    console.log("disconnecting...")
    await cacheable.disconnect()
    console.log("disconnected")
})