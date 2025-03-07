import { createKeyv } from "@keyv/redis"
import { Cacheable } from "cacheable"
import { test } from "node:test"

test("should bypass the secondary store", async (t) => {
    const cacheable = new Cacheable({
        secondary: createKeyv({
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