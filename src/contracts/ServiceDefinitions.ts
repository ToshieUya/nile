import { Handler } from "."

export enum Type {
    COMMAND,
    EVENT,
}
  
export interface ServiceDefinition {
    connectionSetting: {
        hostname: string,
        port: number,
        username: string,
        password: string,
    },
    serviceName: string,
    stream: string,
    type: Type,
    handler: Handler,
    emit?: string,
    emitFailure?: string,
}
