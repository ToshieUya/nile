import { ServiceDefinition, Type } from "./contracts"
import * as amqp from "amqplib"
import { emitter } from "./emitter"
import { emitFailure } from "./emitFailure"

function typeMap(definition: ServiceDefinition): {
  exchange: string,
  queue: string,
  name: string,
  broadcast: string,
} {
    const types = {
        [Type.COMMAND]: {
            exchange: definition.stream,
            queue: definition.stream,
            name: definition.stream,
            broadcast: "direct",
        },
        [Type.EVENT]: {
            exchange: definition.stream,
            queue: definition.serviceName,
            name: "",
            broadcast: "fanout",
        }
    }

    return types[definition.type]
}

export const runner = async (definition: ServiceDefinition): Promise<void> => {
    const connConfig = definition.connectionSetting
    const conn = await amqp.connect({
        ...connConfig
    })

    const listener = typeMap(definition)
  
    const channel = await conn.createChannel()
    const { exchange } = await channel.assertExchange(listener.exchange, listener.broadcast, { durable: false })
    const { queue } = await channel.assertQueue(listener.queue, { autoDelete: true })
    await channel.bindQueue(queue, exchange, listener.name)
    await channel.consume(queue, async (payload) => {
        if (!payload) {
            throw new Error("Payload is undefined")
        }

        try {
            const data = await definition.handler(JSON.parse(payload.content.toString()))
            if (definition.emit) {
                emitter(conn, definition, data)
            }
        } catch (e) {
            if (definition.emitFailure) {
                emitFailure(conn, definition, {
                    message: e.message,
                    detail: e.detail || {},
                })
            }
        }
    }, { noAck: true })
}
