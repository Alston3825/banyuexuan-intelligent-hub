import { AiSuggestionService } from './ai-suggestion.service';
import { QueryAiSuggestionDto } from './dto/query-ai-suggestion.dto';
import { VersionDto } from './dto/version.dto';
export declare class AiSuggestionController {
    private readonly aiSuggestionService;
    constructor(aiSuggestionService: AiSuggestionService);
    findAll(query: QueryAiSuggestionDto): Promise<{}>;
    findOne(id: string): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    accept(id: string, dto: VersionDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    dismiss(id: string, dto: VersionDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
}
