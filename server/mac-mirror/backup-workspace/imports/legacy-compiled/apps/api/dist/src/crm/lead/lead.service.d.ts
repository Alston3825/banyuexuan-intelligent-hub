import { Lead } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { CustomerService } from '../customer/customer.service';
import { QueryLeadDto } from './dto/query-lead.dto';
export declare class LeadService {
    private readonly prisma;
    private readonly customerService;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, customerService: CustomerService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(query: QueryLeadDto): Promise<Lead[]>;
    findOneOrThrow(id: string): Promise<Lead>;
    create(data: {
        name: string;
        phone: string;
        source: Lead['source'];
        storeId?: string;
        remark?: string;
        customerId?: string;
        appointmentType?: Lead['appointmentType'];
        appointmentTime?: string;
        appointmentNote?: string;
    }): Promise<Lead>;
    update(id: string, data: {
        name?: string;
        phone?: string;
        remark?: string;
        customerId?: string;
        appointmentType?: Lead['appointmentType'];
        appointmentTime?: string;
        appointmentNote?: string;
        processed?: boolean;
        processResults?: string[];
        handleRemark?: string;
    }, expectedVersion: number): Promise<Lead>;
    assign(id: string, assignedToId: string, expectedVersion: number): Promise<Lead>;
    markFollowing(id: string): Promise<void>;
    convert(id: string, expectedVersion: number): unknown;
    lose(id: string, lostReason: string, expectedVersion: number): Promise<Lead>;
    private assertVersion;
    private auditCtx;
}
