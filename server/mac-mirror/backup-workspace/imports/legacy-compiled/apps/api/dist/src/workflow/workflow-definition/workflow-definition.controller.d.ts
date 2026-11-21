import { SaveWorkflowDefinitionDto, WorkflowDefinitionService } from './workflow-definition.service';
export declare class WorkflowDefinitionController {
    private readonly workflowDefinitionService;
    constructor(workflowDefinitionService: WorkflowDefinitionService);
    findAll(): any;
    settings(): unknown;
    save(code: string, dto: SaveWorkflowDefinitionDto): unknown;
}
