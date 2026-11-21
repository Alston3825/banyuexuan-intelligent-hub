import { CustomerChannel, CustomerChannelType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { BaseScopedCrudService } from '../../common/base/base-scoped-crud.service';
import { CreateChannelTypeDto, CreateCustomerChannelDto, QueryCustomerChannelDto, UpdateChannelTypeDto, UpdateCustomerChannelDto } from './dto/customer-channel.dto';
export declare class CustomerChannelService extends BaseScopedCrudService<CustomerChannel> {
    private readonly prisma;
    protected readonly entityType = "CustomerChannel";
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    protected get delegate(): any;
    list(query: QueryCustomerChannelDto): unknown;
    createChannel(dto: CreateCustomerChannelDto): Promise<CustomerChannel>;
    updateChannel(id: string, dto: UpdateCustomerChannelDto): Promise<CustomerChannel>;
    removeChannel(id: string): Promise<void>;
    private assertOwn;
    private translateDuplicate;
}
export declare class CustomerChannelTypeService extends BaseScopedCrudService<CustomerChannelType> {
    private readonly prisma;
    protected readonly entityType = "CustomerChannelType";
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    protected get delegate(): any;
    list(): unknown;
    createType(dto: CreateChannelTypeDto): Promise<CustomerChannelType>;
    updateType(id: string, dto: UpdateChannelTypeDto): Promise<CustomerChannelType>;
    removeType(id: string): Promise<void>;
    private assertOwn;
    private translateDuplicate;
}
