import { IntegrationEventsService } from '../../integration/integration-events.service';
import { EmployeeProfile } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { CreateEmployeeProfileDto } from './dto/create-employee-profile.dto';
import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
import { QueryEmployeeProfileDto } from './dto/query-employee-profile.dto';
export declare class EmployeeProfileService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    private readonly integrationEvents;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService, integrationEvents: IntegrationEventsService);
    private decorate;
    findMany(query?: QueryEmployeeProfileDto): unknown;
    findOneOrThrow(id: string): unknown;
    expiryAlerts(withinDays?: number): unknown;
    private idCardFields;
    private bankAccountField;
    private assertEmployeeNoFree;
    private dates;
    private texts;
    create(dto: CreateEmployeeProfileDto): Promise<EmployeeProfile>;
    update(id: string, dto: UpdateEmployeeProfileDto): Promise<EmployeeProfile>;
    nextNo(storeId?: string): any;
    archive(id: string, input: {
        terminationDate?: string;
        reason?: string;
        version: number;
    }): unknown;
    restore(id: string, input: {
        employeeNo?: string;
        version: number;
    }): unknown;
}
