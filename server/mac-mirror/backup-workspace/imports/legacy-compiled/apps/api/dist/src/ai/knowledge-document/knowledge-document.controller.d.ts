import { KnowledgeDocumentService } from './knowledge-document.service';
import { CreateKnowledgeDocumentDto } from './dto/create-knowledge-document.dto';
import { UpdateKnowledgeDocumentDto } from './dto/update-knowledge-document.dto';
export declare class KnowledgeDocumentController {
    private readonly knowledgeDocumentService;
    constructor(knowledgeDocumentService: KnowledgeDocumentService);
    findAll(): Promise<{}>;
    findOne(id: string): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    create(dto: CreateKnowledgeDocumentDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    update(id: string, dto: UpdateKnowledgeDocumentDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    delete(id: string): Promise<void>;
}
