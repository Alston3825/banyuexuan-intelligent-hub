"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ContractStorageService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractStorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path = __importStar(require("path"));
let ContractStorageService = ContractStorageService_1 = class ContractStorageService {
    root;
    constructor(config) {
        this.root = path.resolve(config.get('CONTRACT_STORAGE_DIR') ?? path.join(process.cwd(), 'storage', 'contracts'));
    }
    async save(contractId, subDir, fileName, data) {
        const rel = path.posix.join(contractId, subDir, ContractStorageService_1.safeName(fileName));
        const abs = this.resolve(rel);
        await (0, promises_1.mkdir)(path.dirname(abs), { recursive: true });
        await (0, promises_1.writeFile)(abs, data);
        return rel;
    }
    async readBuffer(rel) {
        try {
            return await (0, promises_1.readFile)(this.resolve(rel));
        }
        catch {
            throw new common_1.NotFoundException('文件不存在或已被移动');
        }
    }
    async removePagesDir(contractId) {
        await (0, promises_1.rm)(this.resolve(path.posix.join(contractId, 'pages')), { recursive: true, force: true });
    }
    async readStream(rel) {
        const abs = this.resolve(rel);
        try {
            const info = await (0, promises_1.stat)(abs);
            return { stream: (0, fs_1.createReadStream)(abs), size: info.size };
        }
        catch {
            throw new common_1.NotFoundException('文件不存在或已被移动');
        }
    }
    async removeContractDir(contractId) {
        await (0, promises_1.rm)(this.resolve(contractId), { recursive: true, force: true });
    }
    resolve(rel) {
        const abs = path.resolve(this.root, rel);
        if (abs !== this.root && !abs.startsWith(this.root + path.sep)) {
            throw new common_1.NotFoundException('非法的文件路径');
        }
        return abs;
    }
    static safeName(name) {
        const base = path.basename(name).replace(/[^\p{L}\p{N}._\-()（）]/gu, '_');
        return base.length > 0 ? base.slice(-120) : 'file';
    }
};
exports.ContractStorageService = ContractStorageService;
exports.ContractStorageService = ContractStorageService = ContractStorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], ContractStorageService);
//# sourceMappingURL=contract-storage.service.js.map