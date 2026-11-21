export interface TraceEvent {
    time: string;
    context: string;
    location?: string;
}
export interface TraceResult {
    state: number;
    events: TraceEvent[];
    company: string;
    num: string;
}
export declare const LOGISTICS_STATE_LABEL: Record<number, string>;
export declare const LOGISTICS_FINAL_STATES: {};
export declare const EXPRESS_COMPANIES: {
    code: string;
    name: string;
}[];
export declare class Kuaidi100Client {
    private readonly logger;
    private readonly url;
    isConfigured(): boolean;
    query(company: string, num: string, phoneTail?: string | null): Promise<TraceResult>;
}
