import { describe, test } from "node:test"
import { createApp } from "./start.js"
import supertest from "supertest"

test("my test", async function (t) {
    const app = createApp()

    app.log.info("app created!")

    await app.listen({
        host: "0.0.0.0",
        port: 0
    })
    app.log.info("app listening!")

    const agent = supertest(app.server)

    await agent
        .get("/")
        .expect(200)

    app.log.info("route ended")

    await app.close()
})