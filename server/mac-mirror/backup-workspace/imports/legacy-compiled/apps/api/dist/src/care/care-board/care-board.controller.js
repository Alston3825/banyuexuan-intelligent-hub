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
exports.CareBoardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const care_board_service_1 = require("./care-board.service");
const query_care_board_dto_1 = require("./dto/query-care-board.dto");
let CareBoardController = class CareBoardController {
    careBoardService;
    constructor(careBoardService) {
        this.careBoardService = careBoardService;
    }
    getBoard(query) {
        return this.careBoardService.getBoard(query);
    }
};
exports.CareBoardController = CareBoardController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('care.board.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_care_board_dto_1.QueryCareBoardDto]),
    __metadata("design:returntype", void 0)
], CareBoardController.prototype, "getBoard", null);
exports.CareBoardController = CareBoardController = __decorate([
    (0, swagger_1.ApiTags)('care/board'),
    (0, common_1.Controller)('care/board'),
    __metadata("design:paramtypes", [care_board_service_1.CareBoardService])
], CareBoardController);
//# sourceMappingURL=care-board.controller.js.map