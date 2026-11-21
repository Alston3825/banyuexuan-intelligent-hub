import { Prisma, PrismaClient } from '@prisma/client';
type Db = PrismaClient | Prisma.TransactionClient;
type Row = Record<string, unknown>;
export interface TableRows {
    table: string;
    rows: Row[];
}
export interface NullEdit {
    table: string;
    column: string;
    items: {
        id: string;
        value: unknown;
    }[];
}
export interface TreeSnapshot {
    version: 1;
    groups: TableRows[];
    nulls: NullEdit[];
}
interface Referrer {
    table: string;
    column: string;
    nullable: boolean;
}
export interface CollectOptions {
    keepNullables?: string[];
}
export declare class TreeCollector {
    private readonly db;
    private readonly referrerCache;
    private readonly pkCache;
    readonly seen: any;
    readonly groups: TableRows[];
    readonly nulls: NullEdit[];
    private readonly keep;
    constructor(db: Db, opts?: CollectOptions);
    idsOf(table: string): string[];
    collect(table: string, ids: string[], depth?: number): Promise<void>;
    collectWhere(table: string, where: string, params: unknown[]): Promise<void>;
    collectByIdColumn(table: string, column: string, ids: string[], extraWhere?: string, extraParams?: unknown[]): Promise<void>;
    snapshot(): TreeSnapshot;
    private assertHasIdPk;
    referrers(table: string): Promise<Referrer[]>;
}
export declare function serializeSnapshot(snap: TreeSnapshot): string;
export declare function parseSnapshot(text: string): TreeSnapshot;
export declare function deleteSnapshot(tx: Db, snap: TreeSnapshot): Promise<void>;
export declare function restoreSnapshot(tx: Db, snap: TreeSnapshot): Promise<void>;
declare const LABELS: Record<string, string>;
export declare function summarizeSnapshot(snap: TreeSnapshot, skipTable?: string): string;
export { LABELS as TABLE_LABELS };
