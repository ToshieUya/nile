/**
 * Handler Interface
 * @param payload any Data that received from listened event
 * @returns Promise<any> Promise of data to be emitted by emitter if any
 */
export declare type Handler = (payload: any) => Promise<any>;
