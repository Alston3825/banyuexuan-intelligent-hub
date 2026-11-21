import { PrismaService } from '../../prisma/prisma.service';
export declare function nextEmployeeNo(prisma: PrismaService, tenantId: string, alsoTaken?: Iterable<string>, storeId?: string | null): Promise<string>;
export declare function normalizeMobile(raw: unknown): string | null;
export declare function assertEmployeeNoForStore(prisma: PrismaService, storeId: string | null | undefined, employeeNo: string): Promise<void>;
