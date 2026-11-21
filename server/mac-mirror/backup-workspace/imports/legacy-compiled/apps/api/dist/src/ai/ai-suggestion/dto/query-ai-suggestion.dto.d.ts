import { AiSuggestionScenario, AiSuggestionStatus } from '@prisma/client';
export declare class QueryAiSuggestionDto {
    scenario?: AiSuggestionScenario;
    businessType?: string;
    businessId?: string;
    status?: AiSuggestionStatus;
}
