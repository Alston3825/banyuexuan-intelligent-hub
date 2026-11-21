import { LeadService } from './lead.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { AssignLeadDto } from './dto/assign-lead.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';
import { LoseLeadDto } from './dto/lose-lead.dto';
import { QueryLeadDto } from './dto/query-lead.dto';
export declare class LeadController {
    private readonly leadService;
    constructor(leadService: LeadService);
    findAll(query: QueryLeadDto): Promise<{}>;
    findOne(id: string): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    create(dto: CreateLeadDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    update(id: string, dto: UpdateLeadDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    assign(id: string, dto: AssignLeadDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    convert(id: string, dto: ConvertLeadDto): unknown;
    lose(id: string, dto: LoseLeadDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
}
