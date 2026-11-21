import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { WorkflowEngineService } from './workflow-engine.service';
export declare class WorkflowArchiveProcessor extends WorkerHost {
    private readonly workflowEngineService;
    private readonly logger;
    constructor(workflowEngineService: WorkflowEngineService);
    process(job: Job<{
        instanceId: string;
    }>): Promise<void>;
}
