import { PrismaService } from '../prisma/prisma.service';
export type MgmtEventType = 'stay.reserved' | 'stay.checked_in' | 'stay.checked_out' | 'stay.room_changed' | 'staff.duty_changed';
export declare class IntegrationEventsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    emit(tenantId: string, storeId: string, eventType: MgmtEventType, entityId: string | null, payload: Record<string, unknown>): any;
}
