import { ServiceAppointment } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { CreateServiceAppointmentDto } from './dto/create-service-appointment.dto';
import { QueryServiceAppointmentDto } from './dto/query-service-appointment.dto';
import { CancelServiceAppointmentDto } from './dto/cancel-service-appointment.dto';
import { FeedbackServiceAppointmentDto } from './dto/feedback-service-appointment.dto';
import { QueryServiceReportDto } from './dto/query-service-report.dto';
export interface ServiceAppointmentReport {
    totalAppointments: number;
    bookedCount: number;
    completedCount: number;
    cancelledCount: number;
    noShowCount: number;
    avgRating: number | null;
    byProduct: {
        productId: string;
        name: string;
        completedCount: number;
    }[];
    byTherapist: {
        therapistId: string;
        name: string;
        completedCount: number;
    }[];
}
export declare class ServiceAppointmentService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(query?: QueryServiceAppointmentDto): any;
    report(query?: QueryServiceReportDto): Promise<ServiceAppointmentReport>;
    findOneOrThrow(id: string): unknown;
    create(dto: CreateServiceAppointmentDto): Promise<ServiceAppointment>;
    complete(id: string, expectedVersion: number): Promise<ServiceAppointment>;
    cancel(id: string, dto: CancelServiceAppointmentDto): Promise<ServiceAppointment>;
    feedback(id: string, dto: FeedbackServiceAppointmentDto): Promise<ServiceAppointment>;
    private auditCtx;
}
