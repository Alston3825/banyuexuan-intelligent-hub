"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CareDocumentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const ai_gateway_client_1 = require("../../ai/ai-gateway/ai-gateway.client");
const care_document_extraction_service_1 = require("./care-document-extraction.service");
const care_storage_service_1 = require("./care-storage.service");
const filesSelect = { orderBy: { sortOrder: 'asc' }, select: { id: true, fileName: true, mimeType: true, sizeBytes: true, sortOrder: true } };
const isHeic = (f) => /^image\/hei[cf]$/i.test(f.mimetype) || /\.hei[cf]$/i.test(f.originalname);
const isPdf = (f) => f.buffer.subarray(0, 4).toString() === '%PDF';
let CareDocumentService = class CareDocumentService {
    prisma;
    storage;
    extraction;
    aiGateway;
    auditLogService;
    ctx;
    constructor(prisma, storage, extraction, aiGateway, auditLogService, ctx) {
        this.prisma = prisma;
        this.storage = storage;
        this.extraction = extraction;
        this.aiGateway = aiGateway;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    list(query) {
        return this.prisma.careDocument.findMany({
            where: { tenantId: this.ctx.tenantId, motherProfileId: query.motherProfileId, babyProfileId: query.babyProfileId, docType: query.docType },
            include: { files: filesSelect },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getOne(id) {
        const doc = await this.prisma.careDocument.findFirst({ where: { id, tenantId: this.ctx.tenantId }, include: { files: filesSelect } });
        if (!doc)
            throw new common_1.NotFoundException('资料不存在');
        return doc;
    }
    async upload(files, meta) {
        if (!files?.length)
            throw new common_1.BadRequestException('请选择照片或 PDF 文件');
        const { motherProfileId, babyProfileId, storeId } = await this.resolveOwner(meta);
        for (const f of files) {
            if (!isPdf(f) && !/^image\/(jpeg|png|webp|hei[cf])$/i.test(f.mimetype) && !isHeic(f)) {
                throw new common_1.BadRequestException(`文件「${this.fileName(f)}」不是照片（JPG/PNG/HEIC）或 PDF`);
            }
        }
        const structured = this.extraction.isStructured(meta.docType);
        const extract = structured && meta.autoExtract !== 'false';
        const created = await this.prisma.careDocument.create({
            data: {
                tenantId: this.ctx.tenantId,
                storeId,
                docType: meta.docType,
                motherProfileId,
                babyProfileId,
                title: meta.title?.trim() || null,
                docDate: meta.docDate ? new Date(meta.docDate) : null,
                remark: meta.remark?.trim() || null,
                status: structured ? 'DRAFT' : 'CONFIRMED',
                extractStatus: extract ? 'PENDING' : 'NONE',
                extractScope: meta.docType === 'DAILY_RECORD' && meta.scope === 'BABY_FEEDING' ? 'BABY_FEEDING' : null,
                confirmedBy: structured ? null : this.ctx.accountId,
                confirmedAt: structured ? null : new Date(),
                createdBy: this.ctx.accountId,
            },
        });
        await this.saveFiles(created.id, files, 0);
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'CareDocument',
            entityId: created.id,
            afterData: { docType: meta.docType, files: files.length },
            tenantId: this.ctx.tenantId,
            storeId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        });
        if (extract)
            this.extraction.enqueue(created.id);
        return this.getOne(created.id);
    }
    async addFiles(id, files) {
        if (!files?.length)
            throw new common_1.BadRequestException('请选择照片或 PDF 文件');
        const doc = await this.getOne(id);
        for (const f of files) {
            if (!isPdf(f) && !/^image\/(jpeg|png|webp|hei[cf])$/i.test(f.mimetype) && !isHeic(f)) {
                throw new common_1.BadRequestException(`文件「${this.fileName(f)}」不是照片（JPG/PNG/HEIC）或 PDF`);
            }
        }
        await this.saveFiles(id, files, doc.files.length);
        return this.getOne(id);
    }
    async updateMeta(id, patch) {
        await this.getOne(id);
        await this.prisma.careDocument.update({
            where: { id },
            data: {
                ...(patch.title !== undefined ? { title: patch.title?.trim() || null } : {}),
                ...(patch.docDate !== undefined ? { docDate: patch.docDate ? new Date(patch.docDate) : null } : {}),
                ...(patch.remark !== undefined ? { remark: patch.remark?.trim() || null } : {}),
                version: { increment: 1 },
            },
        });
        return this.getOne(id);
    }
    async reextract(id) {
        const doc = await this.getOne(id);
        if (!this.extraction.isStructured(doc.docType))
            throw new common_1.BadRequestException('这类资料只做拍照留档，不需要识别');
        if (doc.files.length === 0)
            throw new common_1.BadRequestException('还没有上传照片');
        if (doc.extractStatus === 'PENDING' || doc.extractStatus === 'RUNNING')
            throw new common_1.ConflictException('正在识别中，请稍候');
        await this.prisma.careDocument.update({ where: { id }, data: { extractStatus: 'PENDING', extractError: null } });
        this.extraction.enqueue(id);
        return this.getOne(id);
    }
    async remove(id) {
        const doc = await this.getOne(id);
        const recentArchiveOnly = !this.extraction.isStructured(doc.docType) && Date.now() - doc.createdAt.getTime() < 24 * 3600 * 1000;
        if (doc.status === 'CONFIRMED' && !recentArchiveOnly)
            throw new common_1.ConflictException('已确认归档的资料不能删除（原件需永久保留）；只留档类资料上传后 24 小时内可以删除');
        const linked = (await this.prisma.careMotherAdmission.count({ where: { documentId: id } })) +
            (await this.prisma.careBabyAdmission.count({ where: { documentId: id } })) +
            (await this.prisma.careMotherDischarge.count({ where: { documentId: id } })) +
            (await this.prisma.careBabyDischarge.count({ where: { documentId: id } }));
        if (linked > 0)
            throw new common_1.ConflictException('这份资料已被评估表引用，不能删除');
        await this.prisma.careDocument.delete({ where: { id } });
        await this.storage.removeDocumentDir(id);
        await this.auditLogService.record({
            action: 'DELETE',
            entityType: 'CareDocument',
            entityId: id,
            beforeData: { docType: doc.docType, files: doc.files.length },
            tenantId: this.ctx.tenantId,
            accountId: this.ctx.accountId,
            requestId: this.ctx.requestId,
        });
    }
    async openFile(id, fileId) {
        const file = await this.prisma.careDocumentFile.findFirst({ where: { id: fileId, documentId: id, tenantId: this.ctx.tenantId } });
        if (!file)
            throw new common_1.NotFoundException('文件不存在');
        const { stream, size } = await this.storage.readStream(file.storagePath);
        return { stream, size, mimeType: file.mimeType, fileName: file.fileName };
    }
    fileName(f) {
        return Buffer.from(f.originalname, 'latin1').toString('utf8');
    }
    async saveFiles(documentId, files, startOrder) {
        let order = startOrder;
        for (const f of files) {
            const name = this.fileName(f);
            const stamp = Date.now();
            let storagePath;
            let originalPath = null;
            let mimeType = isPdf(f) ? 'application/pdf' : f.mimetype;
            let displayName = name;
            let size = f.size;
            if (isHeic(f)) {
                let jpeg;
                try {
                    jpeg = await this.aiGateway.normalizeImage(f.buffer);
                }
                catch (err) {
                    throw new common_1.BadRequestException(`苹果 HEIC 照片转换失败（${err.message}）。请在手机上把照片分享为 JPG 再上传，或检查 AI 服务是否在运行`);
                }
                originalPath = await this.storage.save(documentId, `${stamp}-orig-${name}`, f.buffer);
                displayName = name.replace(/\.[^.]+$/, '') + '.jpg';
                storagePath = await this.storage.save(documentId, `${stamp}-${displayName}`, jpeg);
                mimeType = 'image/jpeg';
                size = jpeg.length;
            }
            else {
                storagePath = await this.storage.save(documentId, `${stamp}-${name}`, f.buffer);
            }
            await this.prisma.careDocumentFile.create({
                data: {
                    tenantId: this.ctx.tenantId,
                    documentId,
                    fileName: displayName,
                    storagePath,
                    originalPath,
                    mimeType,
                    sizeBytes: size,
                    sortOrder: order++,
                    createdBy: this.ctx.accountId,
                },
            });
        }
    }
    async resolveOwner(meta) {
        const tenantId = this.ctx.tenantId;
        if (meta.docType === 'BABY_ADMISSION' || meta.docType === 'BABY_DISCHARGE' || meta.babyProfileId) {
            if (!meta.babyProfileId)
                throw new common_1.BadRequestException('宝宝的资料请选择是哪个宝宝');
            const baby = await this.prisma.babyProfile.findFirst({ where: { id: meta.babyProfileId, tenantId } });
            if (!baby)
                throw new common_1.NotFoundException('宝宝档案不存在');
            if (meta.motherProfileId && meta.motherProfileId !== baby.motherProfileId)
                throw new common_1.BadRequestException('宝宝档案和妈妈档案不匹配');
            return { motherProfileId: baby.motherProfileId, babyProfileId: baby.id, storeId: baby.storeId };
        }
        if (!meta.motherProfileId)
            throw new common_1.BadRequestException('请指定妈妈档案');
        const mother = await this.prisma.motherProfile.findFirst({ where: { id: meta.motherProfileId, tenantId } });
        if (!mother)
            throw new common_1.NotFoundException('妈妈档案不存在');
        return { motherProfileId: mother.id, babyProfileId: null, storeId: mother.storeId };
    }
};
exports.CareDocumentService = CareDocumentService;
exports.CareDocumentService = CareDocumentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        care_storage_service_1.CareStorageService,
        care_document_extraction_service_1.CareDocumentExtractionService,
        ai_gateway_client_1.AiGatewayClient,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], CareDocumentService);
//# sourceMappingURL=care-document.service.js.map