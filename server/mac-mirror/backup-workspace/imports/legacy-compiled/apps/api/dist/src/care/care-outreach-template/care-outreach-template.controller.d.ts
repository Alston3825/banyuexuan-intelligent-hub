import { CareOutreachTemplateService } from './care-outreach-template.service';
import { CreateCareOutreachTemplateDto } from './dto/create-care-outreach-template.dto';
import { UpdateCareOutreachTemplateDto } from './dto/update-care-outreach-template.dto';
export declare class CareOutreachTemplateController {
    private readonly careOutreachTemplateService;
    constructor(careOutreachTemplateService: CareOutreachTemplateService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{}>;
    findOne(id: string): unknown;
    create(dto: CreateCareOutreachTemplateDto): unknown;
    update(id: string, dto: UpdateCareOutreachTemplateDto): unknown;
}
