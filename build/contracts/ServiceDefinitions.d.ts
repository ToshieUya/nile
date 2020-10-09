import { Handler } from ".";
export declare enum Type {
    COMMAND = 0,
    EVENT = 1
}
export interface ServiceDefinition {
    connectionSetting: {
        hostname: string;
        port: number;
        username: string;
        password: string;
    };
    serviceName: string;
    stream: string;
    type: Type;
    handler: Handler;
    emit?: string;
    emitFailure?: string;
}
