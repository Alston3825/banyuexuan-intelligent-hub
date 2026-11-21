import { BabyProfile } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { CareStorageService } from '../care-document/care-storage.service';
import { CreateBabyProfileDto } from './dto/create-baby-profile.dto';
import { UpdateBabyProfileDto } from './dto/update-baby-profile.dto';
import { QueryBabyProfileDto } from './dto/query-baby-profile.dto';
export declare class BabyProfileService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    private readonly storage;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService, storage: CareStorageService);
    findMany(query?: QueryBabyProfileDto): Promise<BabyProfile[]>;
    getRiskTags(id: string): any;
    setRiskTags(id: string, tagIds: string[]): unknown;
    findOneOrThrow(id: string): Promise<BabyProfile>;
    create(dto: CreateBabyProfileDto): Promise<BabyProfile>;
    update(id: string, dto: UpdateBabyProfileDto): Promise<BabyProfile>;
    getDeleteCheck(id: string): unknown;
    remove(id: string, force?: boolean, confirmName?: string): Promise<void>;
    private auditCtx;
}
