import { PrismaService } from '../../prisma/prisma.service';
export declare class PermissionService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findMany(): import(".prisma/client").Prisma.PrismaPromise<{}>;
}
