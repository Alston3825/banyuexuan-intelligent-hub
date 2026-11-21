import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionLookupService } from '../context/permission-lookup.service';
export declare class PermissionGuard implements CanActivate {
    private readonly reflector;
    private readonly permissionLookup;
    constructor(reflector: Reflector, permissionLookup: PermissionLookupService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
