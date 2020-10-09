import * as amqp from "amqplib"
import { ServiceDefinition } from "./contracts"

export const emitter = async (conn: amqp.Connection, def: ServiceDefinition, payload: unknown): Promise<void> => {
    const exhangeName = `${def.emit}`
    const channel = await conn.createChannel()
    const { exchange } = await channel.assertExchange(exhangeName, "fanout", { durable: false })
    channel.publish(exchange, "", Buffer.from(JSON.stringify(payload)))
}
