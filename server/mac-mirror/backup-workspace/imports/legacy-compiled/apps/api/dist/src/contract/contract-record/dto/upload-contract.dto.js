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
exports.CreateManualContractDto = exports.UploadContractDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UploadContractDto {
    storeId;
}
exports.UploadContractDto = UploadContractDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '门店；不传则用当前账号所属门店' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadContractDto.prototype, "storeId", void 0);
class CreateManualContractDto {
    storeId;
}
exports.CreateManualContractDto = CreateManualContractDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '门店；不传则用当前账号所属门店' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateManualContractDto.prototype, "storeId", void 0);
//# sourceMappingURL=upload-contract.dto.js.map