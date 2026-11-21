import { Controller } from '@nestjs/common';
import { CareAbnormalityAgentService } from './care-abnormality-agent.service';
export declare class CareAbnormalityAgentController {
    private readonly careAbnormalityAgentService;
    constructor(careAbnormalityAgentService: CareAbnormalityAgentService);
    suggest(abnormalityId: string): Promise<{
        suggestion: Controller;
        answer: string;
    }>;
}
