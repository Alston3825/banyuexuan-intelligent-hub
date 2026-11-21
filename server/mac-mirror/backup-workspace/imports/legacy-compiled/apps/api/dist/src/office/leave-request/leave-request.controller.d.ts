import { LeaveRequestService } from './leave-request.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { QueryLeaveRequestDto } from './dto/query-leave-request.dto';
import { CancelLeaveRequestDto } from './dto/cancel-leave-request.dto';
import { VersionDto } from './dto/version.dto';
export declare class LeaveRequestController {
    private readonly leaveRequestService;
    constructor(leaveRequestService: LeaveRequestService);
    findAll(query: QueryLeaveRequestDto): Promise<{}>;
    findOne(id: string): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    create(dto: CreateLeaveRequestDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    submit(id: string, dto: VersionDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    cancel(id: string, dto: CancelLeaveRequestDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
}
