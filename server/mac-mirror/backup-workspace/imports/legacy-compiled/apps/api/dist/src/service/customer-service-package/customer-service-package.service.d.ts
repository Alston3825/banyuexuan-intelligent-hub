import { CustomerServicePackage } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { CreateCustomerServicePackageDto } from './dto/create-customer-service-package.dto';
import { QueryCustomerServicePackageDto } from './dto/query-customer-service-package.dto';
import { QueryCustomerServicePackageReportDto } from './dto/query-customer-service-package-report.dto';
export interface CustomerServicePackageReport {
    totalSold: number;
    totalAmount: number;
    activeCount: number;
    exhaustedCount: number;
    remainingSessionsTotal: number;
    byPackage: {
        packageId: string;
        name: string;
        soldCount: number;
        amount: number;
    }[];
}
export declare class CustomerServicePackageService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(query?: QueryCustomerServicePackageDto): any;
    findOneOrThrow(id: string): unknown;
    report(query?: QueryCustomerServicePackageReportDto): Promise<CustomerServicePackageReport>;
    create(dto: CreateCustomerServicePackageDto): Promise<CustomerServicePackage>;
}
