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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const workspace_service_1 = require("./workspace.service");
const workbench_service_1 = require("./workbench.service");
let WorkspaceController = class WorkspaceController {
    workspaceService;
    wb;
    constructor(workspaceService, wb) {
        this.workspaceService = workspaceService;
        this.wb = wb;
    }
    todos() {
        return this.workspaceService.todos();
    }
    async badge() {
        const [business, reminders] = await Promise.all([
            this.workspaceService.badge(),
            this.wb.remindersForDay(),
        ]);
        const pending = reminders.filter((r) => !r.done);
        return {
            total: business.total + pending.length,
            overdue: business.overdue + pending.filter((r) => r.overdue).length,
        };
    }
    myTasks() { return this.wb.tasks(); }
    createTask(b) { return this.wb.createTask(b); }
    updateTask(id, b) { return this.wb.updateTask(id, b); }
    deleteTask(id) { return this.wb.deleteTask(id); }
    myReminders(date) { return this.wb.remindersForDay(date); }
    reminderDefs() { return this.wb.reminderDefs(); }
    reminderBadge() { return this.wb.reminderBadge().then((n) => ({ pending: n })); }
    createReminder(b) { return this.wb.createReminder(b); }
    updateReminder(id, b) { return this.wb.updateReminder(id, b); }
    deleteReminder(id) { return this.wb.deleteReminder(id); }
    markReminder(id, b) { return this.wb.markReminder(id, b); }
    myOngoing() { return this.wb.ongoing(); }
    createOngoing(b) { return this.wb.createOngoing(b); }
    updateOngoing(id, b) { return this.wb.updateOngoing(id, b); }
    deleteOngoing(id) { return this.wb.deleteOngoing(id); }
    addStep(id, b) { return this.wb.addStep(id, b); }
    updateStep(id, sid, b) { return this.wb.updateStep(id, sid, b); }
    deleteStep(id, sid) { return this.wb.deleteStep(id, sid); }
    myTheme() { return this.wb.myTheme(); }
    saveTheme(b) { return this.wb.saveTheme(b); }
    myLinks() { return this.wb.links(); }
    saveLinks(b) { return this.wb.saveLinks(b); }
};
exports.WorkspaceController = WorkspaceController;
__decorate([
    (0, common_1.Get)('todos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "todos", null);
__decorate([
    (0, common_1.Get)('todos/badge'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorkspaceController.prototype, "badge", null);
__decorate([
    (0, common_1.Get)('my/tasks'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "myTasks", null);
__decorate([
    (0, common_1.Post)('my/tasks'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "createTask", null);
__decorate([
    (0, common_1.Patch)('my/tasks/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "updateTask", null);
__decorate([
    (0, common_1.Delete)('my/tasks/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "deleteTask", null);
__decorate([
    (0, common_1.Get)('my/reminders'),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "myReminders", null);
__decorate([
    (0, common_1.Get)('my/reminders/defs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "reminderDefs", null);
__decorate([
    (0, common_1.Get)('my/reminders/badge'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "reminderBadge", null);
__decorate([
    (0, common_1.Post)('my/reminders'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "createReminder", null);
__decorate([
    (0, common_1.Patch)('my/reminders/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "updateReminder", null);
__decorate([
    (0, common_1.Delete)('my/reminders/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "deleteReminder", null);
__decorate([
    (0, common_1.Post)('my/reminders/:id/mark'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "markReminder", null);
__decorate([
    (0, common_1.Get)('my/ongoing'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "myOngoing", null);
__decorate([
    (0, common_1.Post)('my/ongoing'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "createOngoing", null);
__decorate([
    (0, common_1.Patch)('my/ongoing/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "updateOngoing", null);
__decorate([
    (0, common_1.Delete)('my/ongoing/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "deleteOngoing", null);
__decorate([
    (0, common_1.Post)('my/ongoing/:id/steps'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "addStep", null);
__decorate([
    (0, common_1.Patch)('my/ongoing/:id/steps/:stepId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('stepId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "updateStep", null);
__decorate([
    (0, common_1.Delete)('my/ongoing/:id/steps/:stepId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('stepId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "deleteStep", null);
__decorate([
    (0, common_1.Get)('my/theme'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "myTheme", null);
__decorate([
    (0, common_1.Put)('my/theme'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "saveTheme", null);
__decorate([
    (0, common_1.Get)('my/links'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "myLinks", null);
__decorate([
    (0, common_1.Put)('my/links'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkspaceController.prototype, "saveLinks", null);
exports.WorkspaceController = WorkspaceController = __decorate([
    (0, swagger_1.ApiTags)('workspace'),
    (0, common_1.Controller)('workspace'),
    __metadata("design:paramtypes", [workspace_service_1.WorkspaceService,
        workbench_service_1.WorkbenchService])
], WorkspaceController);
//# sourceMappingURL=workspace.controller.js.map