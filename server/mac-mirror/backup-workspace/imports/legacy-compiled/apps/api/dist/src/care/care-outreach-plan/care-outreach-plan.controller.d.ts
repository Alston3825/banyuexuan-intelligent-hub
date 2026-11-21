import { CareOutreachPlanService } from './care-outreach-plan.service';
import { CreateCareOutreachPlanDto } from './dto/create-care-outreach-plan.dto';
import { QueryCareOutreachPlanDto } from './dto/query-care-outreach-plan.dto';
import { TerminateCareOutreachPlanDto } from './dto/terminate-care-outreach-plan.dto';
import { CompleteCareOutreachTaskDto } from './dto/complete-care-outreach-task.dto';
export declare class CareOutreachPlanController {
    private readonly careOutreachPlanService;
    constructor(careOutreachPlanService: CareOutreachPlanService);
    findPendingTasks(): unknown;
    findAll(query: QueryCareOutreachPlanDto): import(".prisma/client").Prisma.PrismaPromise<{}>;
    findOne(id: string): unknown;
    create(dto: CreateCareOutreachPlanDto): unknown;
    terminate(id: string, dto: TerminateCareOutreachPlanDto): unknown;
    completeTask(taskId: string, dto: CompleteCareOutreachTaskDto): unknown;
}
