"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runner = void 0;
const contracts_1 = require("./contracts");
const amqp = __importStar(require("amqplib"));
const emitter_1 = require("./emitter");
const emitFailure_1 = require("./emitFailure");
function typeMap(definition) {
    const types = {
        [contracts_1.Type.COMMAND]: {
            exchange: definition.stream,
            queue: definition.stream,
            name: definition.stream,
            broadcast: "direct",
        },
        [contracts_1.Type.EVENT]: {
            exchange: definition.stream,
            queue: definition.serviceName,
            name: "",
            broadcast: "fanout",
        }
    };
    return types[definition.type];
}
exports.runner = (definition) => __awaiter(void 0, void 0, void 0, function* () {
    const connConfig = definition.connectionSetting;
    const conn = yield amqp.connect(Object.assign({}, connConfig));
    const listener = typeMap(definition);
    const channel = yield conn.createChannel();
    const { exchange } = yield channel.assertExchange(listener.exchange, listener.broadcast, { durable: false });
    const { queue } = yield channel.assertQueue(listener.queue, { autoDelete: true });
    yield channel.bindQueue(queue, exchange, listener.name);
    yield channel.consume(queue, (payload) => __awaiter(void 0, void 0, void 0, function* () {
        if (!payload) {
            throw new Error("Payload is undefined");
        }
        try {
            const data = yield definition.handler(JSON.parse(payload.content.toString()));
            if (definition.emit) {
                emitter_1.emitter(conn, definition, data);
            }
        }
        catch (e) {
            if (definition.emitFailure) {
                emitFailure_1.emitFailure(conn, definition, {
                    message: e.message,
                    detail: e.detail || {},
                });
            }
        }
    }), { noAck: true });
});
