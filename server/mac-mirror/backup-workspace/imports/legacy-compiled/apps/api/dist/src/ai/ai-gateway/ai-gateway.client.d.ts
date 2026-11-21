import { ConfigService } from '@nestjs/config';
export interface AiChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface AiChatResult {
    content: string;
    provider: string;
    model: string;
    latencyMs: number;
    usedFallback: boolean;
}
export interface AiEmbeddingResult {
    embeddings: number[][];
    provider: string;
    model: string;
    latencyMs: number;
    usedFallback: boolean;
}
export interface ContractExtractWarning {
    field: string;
    level: 'missing' | 'warn' | 'info';
    message: string;
    page: number | null;
}
export interface ContractExtractData {
    contract_no: string | null;
    signed_date: string | null;
    mother_name: string | null;
    id_card_no: string | null;
    phone: string | null;
    hospital: string | null;
    address: string | null;
    emergency_name: string | null;
    emergency_relation: string | null;
    emergency_phone: string | null;
    fetus: 'single' | 'twin' | 'multi' | null;
    due_date: string | null;
    room_type_text: string | null;
    orientation: 'SOUTH' | 'NORTH' | 'BOTH' | null;
    care_mode: 'ONE_TO_ONE' | 'ONE_TO_TWO' | null;
    days_text: string | null;
    in_house_days: number | null;
    home_service_days: number | null;
    package_amount: number | null;
    deposit_amount: number | null;
    gift_items: {
        name: string;
        quantity: string | null;
        needs_review: boolean;
        page: number;
    }[];
    extra_notes: {
        where: string | null;
        text: string;
        page: number;
        kind: string | null;
    }[];
}
export interface ContractExtractResult {
    data: ContractExtractData;
    warnings: ContractExtractWarning[];
    pages: {
        index: number;
        kind: string | null;
        printed_page_no: number | null;
        source_name: string;
        jpeg_b64: string;
    }[];
    raw_pages: unknown[];
    focus: unknown;
    focus_amounts: unknown;
    model: string | null;
    latency_ms: number;
}
export interface CareFormExtractResult {
    data: Record<string, unknown>;
    warnings: {
        field: string;
        level: 'info' | 'warn' | 'missing';
        message: string;
    }[];
    model: string | null;
    latency_ms: number;
    page_count: number;
}
export declare class AiGatewayClient {
    private readonly configService;
    constructor(configService: ConfigService);
    complete(messages: AiChatMessage[]): Promise<AiChatResult>;
    embed(texts: string[]): Promise<AiEmbeddingResult>;
    extractContract(files: {
        name: string;
        data: Buffer;
    }[]): Promise<ContractExtractResult>;
    extractCareForm(spec: {
        formTitle: string;
        description: string;
        fields: unknown[];
    }, files: {
        name: string;
        data: Buffer;
    }[]): Promise<CareFormExtractResult>;
    normalizeImage(data: Buffer): Promise<Buffer>;
    private post;
}
