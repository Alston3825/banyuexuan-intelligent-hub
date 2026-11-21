"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformModule = void 0;
const common_1 = require("@nestjs/common");
const region_module_1 = require("./region/region.module");
const store_module_1 = require("./store/store.module");
const department_module_1 = require("./department/department.module");
const team_module_1 = require("./team/team.module");
const position_module_1 = require("./position/position.module");
const account_module_1 = require("./account/account.module");
const role_module_1 = require("./role/role.module");
const permission_module_1 = require("./permission/permission.module");
const application_module_1 = require("./application/application.module");
const tag_module_1 = require("./tag/tag.module");
const parameter_module_1 = require("./parameter/parameter.module");
let PlatformModule = class PlatformModule {
};
exports.PlatformModule = PlatformModule;
exports.PlatformModule = PlatformModule = __decorate([
    (0, common_1.Module)({
        imports: [
            region_module_1.RegionModule,
            store_module_1.StoreModule,
            department_module_1.DepartmentModule,
            team_module_1.TeamModule,
            position_module_1.PositionModule,
            account_module_1.AccountModule,
            role_module_1.RoleModule,
            permission_module_1.PermissionModule,
            application_module_1.ApplicationModule,
            tag_module_1.TagModule,
            parameter_module_1.ParameterModule,
        ],
    })
], PlatformModule);
//# sourceMappingURL=platform.module.js.map