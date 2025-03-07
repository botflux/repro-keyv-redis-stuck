import { createClient, createKeyv } from "@keyv/redis"
import { Cacheable } from "cacheable"
import { once } from "node:events"
import { test } from "node:test"
import { setTimeout } from "node:timers/promises"

test("should bypass the secondary store", async (t) => {
    const client = createClient({
        url: "redis://localhost:6554",
        disableOfflineQueue: true
    })

    client.on("error", (err) => console.log("error while connecting", err.message))

    client.connect().catch(err => console.log("client.connect() error", err.message))

    while (!client.isOpen) {
        console.log("not open yet")
        await setTimeout(3_000)
    }

    await client.get("")
        .catch(err => console.log("client.get() error", err.message))
    console.log("done!")
    await client.disconnect()
})