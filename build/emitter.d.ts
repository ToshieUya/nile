import * as amqp from "amqplib";
import { ServiceDefinition } from "./contracts";
export declare const emitter: (conn: amqp.Connection, def: ServiceDefinition, payload: unknown) => Promise<void>;
