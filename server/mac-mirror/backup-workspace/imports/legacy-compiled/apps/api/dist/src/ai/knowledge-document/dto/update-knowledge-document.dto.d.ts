import { CommonStatus } from '@prisma/client';
export declare class UpdateKnowledgeDocumentDto {
    title?: string;
    content?: string;
    category?: string;
    status?: CommonStatus;
    version: number;
}
