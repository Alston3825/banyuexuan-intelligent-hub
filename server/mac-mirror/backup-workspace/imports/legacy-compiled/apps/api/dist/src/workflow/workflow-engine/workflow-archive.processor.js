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
var WorkflowArchiveProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowArchiveProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const workflow_engine_service_1 = require("./workflow-engine.service");
const queue_constants_1 = require("../../queue/queue.constants");
let WorkflowArchiveProcessor = WorkflowArchiveProcessor_1 = class WorkflowArchiveProcessor extends bullmq_1.WorkerHost {
    workflowEngineService;
    logger = new common_1.Logger(WorkflowArchiveProcessor_1.name);
    constructor(workflowEngineService) {
        super();
        this.workflowEngineService = workflowEngineService;
    }
    async process(job) {
        await this.workflowEngineService.archive(job.data.instanceId);
        this.logger.log(`自动归档工作流实例 ${job.data.instanceId}`);
    }
};
exports.WorkflowArchiveProcessor = WorkflowArchiveProcessor;
exports.WorkflowArchiveProcessor = WorkflowArchiveProcessor = WorkflowArchiveProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(queue_constants_1.WORKFLOW_ARCHIVE_QUEUE),
    __metadata("design:paramtypes", [workflow_engine_service_1.WorkflowEngineService])
], WorkflowArchiveProcessor);
//# sourceMappingURL=workflow-archive.processor.js.map