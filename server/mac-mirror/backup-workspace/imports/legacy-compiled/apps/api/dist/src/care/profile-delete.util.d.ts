import { Prisma, PrismaClient } from '@prisma/client';
import { TreeCollector } from '../common/recycle/recycle-tree.util';
type Db = PrismaClient | Prisma.TransactionClient;
export declare function motherProfilesDeleteCheck(db: Db, motherIds: string[]): unknown;
export declare function deleteMotherProfilesTx(tx: Prisma.TransactionClient, motherIds: string[]): Promise<string[]>;
export declare function addProfileExtras(c: TreeCollector): Promise<void>;
export {};
