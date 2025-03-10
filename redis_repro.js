import { createClient } from "redis"
import { test } from "node:test"

test("should not be blocked by get() when redis is unavailable even on the first connection", async (t) => {
    const client = createClient({
        // This redis instance does not exist
        url: "redis://localhost:17888",
        disableOfflineQueue: true
    })

    client.on("error", () => {})

    console.log("connecting...")
    await client.connect()
    console.log("connected!")

    console.log("trying to get foo...")
    await client.get("foo")
    console.log("disconnecting...")
    await client.disconnect()
    console.log("disconnected")
})