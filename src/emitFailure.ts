import * as amqp from "amqplib"
import { ServiceDefinition } from "./contracts"
import { emitter } from "./emitter"

export const emitFailure = async (conn: amqp.Connection, def: ServiceDefinition, payload: unknown): Promise<void> => {
    def.emit = `${def.emit}.failed`
    emitter(conn, def, payload)
}
