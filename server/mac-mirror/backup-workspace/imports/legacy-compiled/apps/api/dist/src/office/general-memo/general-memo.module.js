"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneralMemoModule = void 0;
const common_1 = require("@nestjs/common");
const workflow_engine_module_1 = require("../../workflow/workflow-engine/workflow-engine.module");
const general_memo_controller_1 = require("./general-memo.controller");
const general_memo_service_1 = require("./general-memo.service");
let GeneralMemoModule = class GeneralMemoModule {
};
exports.GeneralMemoModule = GeneralMemoModule;
exports.GeneralMemoModule = GeneralMemoModule = __decorate([
    (0, common_1.Module)({
        imports: [workflow_engine_module_1.WorkflowEngineModule],
        controllers: [general_memo_controller_1.GeneralMemoController],
        providers: [general_memo_service_1.GeneralMemoService],
        exports: [general_memo_service_1.GeneralMemoService],
    })
], GeneralMemoModule);
//# sourceMappingURL=general-memo.module.js.map