import { createClient } from "redis"
import { test } from "node:test"
import { setTimeout } from "timers/promises"

test("should not be blocked by get() when redis is unavailable even on the first connection", async (t) => {
    const client = createClient({
        // This redis instance does not exist
        url: "redis://localhost:17888",
        disableOfflineQueue: true
    })

    client.on("error", () => {})

    console.log("connecting...")
    client.connect().catch(() => {})

    while (!client.isOpen) {
        console.log("waiting to be opened")
        await setTimeout(10)
    }

    console.log("connected!")

    console.log("trying to get foo...")
    await client.get("foo").catch(e => console.log("error getting 'foo'", e))
    console.log("disconnecting...")
    await client.disconnect()
    console.log("disconnected")
})