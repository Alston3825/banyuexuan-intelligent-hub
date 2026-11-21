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
exports.ServiceAppointmentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const service_appointment_service_1 = require("./service-appointment.service");
const create_service_appointment_dto_1 = require("./dto/create-service-appointment.dto");
const query_service_appointment_dto_1 = require("./dto/query-service-appointment.dto");
const cancel_service_appointment_dto_1 = require("./dto/cancel-service-appointment.dto");
const feedback_service_appointment_dto_1 = require("./dto/feedback-service-appointment.dto");
const version_dto_1 = require("./dto/version.dto");
const query_service_report_dto_1 = require("./dto/query-service-report.dto");
let ServiceAppointmentController = class ServiceAppointmentController {
    serviceAppointmentService;
    constructor(serviceAppointmentService) {
        this.serviceAppointmentService = serviceAppointmentService;
    }
    findAll(query) {
        return this.serviceAppointmentService.findMany(query);
    }
    report(query) {
        return this.serviceAppointmentService.report(query);
    }
    findOne(id) {
        return this.serviceAppointmentService.findOneOrThrow(id);
    }
    create(dto) {
        return this.serviceAppointmentService.create(dto);
    }
    complete(id, dto) {
        return this.serviceAppointmentService.complete(id, dto.version);
    }
    cancel(id, dto) {
        return this.serviceAppointmentService.cancel(id, dto);
    }
    feedback(id, dto) {
        return this.serviceAppointmentService.feedback(id, dto);
    }
};
exports.ServiceAppointmentController = ServiceAppointmentController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('service.appointment.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_service_appointment_dto_1.QueryServiceAppointmentDto]),
    __metadata("design:returntype", void 0)
], ServiceAppointmentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('report'),
    (0, require_permission_decorator_1.RequirePermission)('service.appointment.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_service_report_dto_1.QueryServiceReportDto]),
    __metadata("design:returntype", void 0)
], ServiceAppointmentController.prototype, "report", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('service.appointment.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServiceAppointmentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('service.appointment.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_service_appointment_dto_1.CreateServiceAppointmentDto]),
    __metadata("design:returntype", void 0)
], ServiceAppointmentController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, require_permission_decorator_1.RequirePermission)('service.appointment.complete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, version_dto_1.VersionDto]),
    __metadata("design:returntype", void 0)
], ServiceAppointmentController.prototype, "complete", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, require_permission_decorator_1.RequirePermission)('service.appointment.cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cancel_service_appointment_dto_1.CancelServiceAppointmentDto]),
    __metadata("design:returntype", void 0)
], ServiceAppointmentController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)(':id/feedback'),
    (0, require_permission_decorator_1.RequirePermission)('service.appointment.feedback'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, feedback_service_appointment_dto_1.FeedbackServiceAppointmentDto]),
    __metadata("design:returntype", void 0)
], ServiceAppointmentController.prototype, "feedback", null);
exports.ServiceAppointmentController = ServiceAppointmentController = __decorate([
    (0, swagger_1.ApiTags)('service/appointment'),
    (0, common_1.Controller)('service/appointments'),
    __metadata("design:paramtypes", [service_appointment_service_1.ServiceAppointmentService])
], ServiceAppointmentController);
//# sourceMappingURL=service-appointment.controller.js.map