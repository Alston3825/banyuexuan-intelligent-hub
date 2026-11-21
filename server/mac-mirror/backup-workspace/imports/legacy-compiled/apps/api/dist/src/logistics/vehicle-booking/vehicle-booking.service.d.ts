import { VehicleBooking } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { CreateVehicleBookingDto } from './dto/create-vehicle-booking.dto';
import { QueryVehicleBookingDto } from './dto/query-vehicle-booking.dto';
export declare class VehicleBookingService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(query?: QueryVehicleBookingDto): Promise<VehicleBooking[]>;
    findOneOrThrow(id: string): Promise<VehicleBooking>;
    create(dto: CreateVehicleBookingDto): Promise<VehicleBooking>;
    cancel(id: string, cancelReason: string, expectedVersion: number): Promise<VehicleBooking>;
    private auditCtx;
}
