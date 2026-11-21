import { DemoApprovalRequest, WorkflowInstance } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { WorkflowEngineService } from '../workflow-engine/workflow-engine.service';
export declare class DemoApprovalService {
    private readonly prisma;
    private readonly workflowEngineService;
    private readonly ctx;
    constructor(prisma: PrismaService, workflowEngineService: WorkflowEngineService, ctx: RequestContextService);
    findMany(): Promise<DemoApprovalRequest[]>;
    findOneOrThrow(id: string): Promise<DemoApprovalRequest>;
    create(data: {
        title: string;
        content: string;
        amount?: number;
    }): Promise<DemoApprovalRequest>;
    submit(id: string): Promise<WorkflowInstance>;
    private actor;
}
