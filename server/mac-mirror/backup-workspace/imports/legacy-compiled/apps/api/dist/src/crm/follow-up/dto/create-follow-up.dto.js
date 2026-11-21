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
exports.CreateFollowUpDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const BUSINESS_TYPES = ['LEAD', 'OPPORTUNITY', 'CUSTOMER'];
class CreateFollowUpDto {
    businessType;
    businessId;
    type;
    content;
    nextFollowUpAt;
}
exports.CreateFollowUpDto = CreateFollowUpDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: BUSINESS_TYPES }),
    (0, class_validator_1.IsIn)(BUSINESS_TYPES),
    __metadata("design:type", Object)
], CreateFollowUpDto.prototype, "businessType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFollowUpDto.prototype, "businessId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.FollowUpType }),
    (0, class_validator_1.IsIn)(Object.values(client_1.FollowUpType)),
    __metadata("design:type", typeof (_a = typeof client_1.FollowUpType !== "undefined" && client_1.FollowUpType) === "function" ? _a : Object)
], CreateFollowUpDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFollowUpDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateFollowUpDto.prototype, "nextFollowUpAt", void 0);
//# sourceMappingURL=create-follow-up.dto.js.map