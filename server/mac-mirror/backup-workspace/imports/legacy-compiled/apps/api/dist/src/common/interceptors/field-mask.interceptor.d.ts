import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PermissionLookupService } from '../context/permission-lookup.service';
export declare class FieldMaskInterceptor implements NestInterceptor {
    private readonly reflector;
    private readonly permissionLookup;
    constructor(reflector: Reflector, permissionLookup: PermissionLookupService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
    private maskResult;
}
