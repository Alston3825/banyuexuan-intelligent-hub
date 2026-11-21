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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCareOutreachTemplateDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const care_outreach_template_item_dto_1 = require("./care-outreach-template-item.dto");
class UpdateCareOutreachTemplateDto {
    name;
    status;
    items;
    version;
}
exports.UpdateCareOutreachTemplateDto = UpdateCareOutreachTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCareOutreachTemplateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.CommonStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.CommonStatus),
    __metadata("design:type", typeof (_a = typeof client_1.CommonStatus !== "undefined" && client_1.CommonStatus) === "function" ? _a : Object)
], UpdateCareOutreachTemplateDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [care_outreach_template_item_dto_1.CareOutreachTemplateItemDto], required: false, description: '若提供则整体替换关怀节点列表' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => care_outreach_template_item_dto_1.CareOutreachTemplateItemDto),
    __metadata("design:type", Array)
], UpdateCareOutreachTemplateDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '乐观锁版本号' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateCareOutreachTemplateDto.prototype, "version", void 0);
//# sourceMappingURL=update-care-outreach-template.dto.js.map