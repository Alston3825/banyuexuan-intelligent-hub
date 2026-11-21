import { DeviceEvent, DeviceShadow } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { RoomCallService } from '../../room/room-call/room-call.service';
import { UtilityExpenseService } from '../../logistics/utility-expense/utility-expense.service';
import { DataScopeService } from '../../common/scope/data-scope.service';
export declare class DeviceGatewayService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    private readonly roomCallService;
    private readonly utilityExpenseService;
    private readonly dataScopeService;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService, roomCallService: RoomCallService, utilityExpenseService: UtilityExpenseService, dataScopeService: DataScopeService);
    private getDeviceOrThrow;
    private getDeviceWithTypeOrThrow;
    reportEvent(dto: {
        deviceId: string;
        eventType: string;
        payload?: Record<string, unknown>;
    }): Promise<DeviceEvent>;
    findEvents(query?: {
        deviceId?: string;
        storeId?: string;
    }): Promise<DeviceEvent[]>;
    getShadow(deviceId: string): Promise<DeviceShadow>;
    issueCommand(deviceId: string, desiredState: Record<string, unknown>): Promise<DeviceShadow>;
    confirmCommand(deviceId: string): Promise<DeviceShadow>;
    private convertToBusinessRecord;
    private convertCallEvent;
    private convertUtilityMeterEvent;
    private auditCtx;
}
