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
exports.UpdateCareFormTemplateDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const care_form_template_field_dto_1 = require("./care-form-template-field.dto");
class UpdateCareFormTemplateDto {
    name;
    scene;
    status;
    fields;
    version;
}
exports.UpdateCareFormTemplateDto = UpdateCareFormTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCareFormTemplateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.CareFormScene }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.CareFormScene),
    __metadata("design:type", typeof (_a = typeof client_1.CareFormScene !== "undefined" && client_1.CareFormScene) === "function" ? _a : Object)
], UpdateCareFormTemplateDto.prototype, "scene", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: ['ACTIVE', 'INACTIVE'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['ACTIVE', 'INACTIVE']),
    __metadata("design:type", String)
], UpdateCareFormTemplateDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        type: [care_form_template_field_dto_1.CareFormTemplateFieldDto],
        description: '不传则不改字段绑定；传了则整体替换为这个新的字段列表',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => care_form_template_field_dto_1.CareFormTemplateFieldDto),
    __metadata("design:type", Array)
], UpdateCareFormTemplateDto.prototype, "fields", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '乐观锁版本号' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateCareFormTemplateDto.prototype, "version", void 0);
//# sourceMappingURL=update-care-form-template.dto.js.map