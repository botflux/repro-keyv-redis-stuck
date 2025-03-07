import { createClient, createKeyv } from "@keyv/redis"
import { Cacheable } from "cacheable"
import { test } from "node:test"

test("should bypass the secondary store", async (t) => {
    const client = createClient({
        url: "redis://localhost:6554"
    })

    // client.on("error", e => {
    //     console.log(`error ${e.message}`)
    // })

    console.log("connecting...")
    await client.connect()
    console.log("connected")

    console.log("trying to get foo...")
    await client.get("foo")
    console.log("disconnecting...")
    await client.disconnect()
    console.log("disconnected")
})