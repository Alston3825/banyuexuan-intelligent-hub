import { DemoApprovalService } from './demo-approval.service';
import { CreateDemoApprovalDto } from './dto/create-demo-approval.dto';
export declare class DemoApprovalController {
    private readonly demoApprovalService;
    constructor(demoApprovalService: DemoApprovalService);
    findAll(): Promise<{}>;
    findOne(id: string): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    create(dto: CreateDemoApprovalDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    submit(id: string): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
}
