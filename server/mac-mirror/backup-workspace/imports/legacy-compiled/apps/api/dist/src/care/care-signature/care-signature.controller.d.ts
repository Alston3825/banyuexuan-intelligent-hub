import { CareConfirmMethod, CareSignShift } from '@prisma/client';
import type { Request } from 'express';
import { CareConfirmPublicService } from './care-confirm-public.service';
import { CareSignatureService } from './care-signature.service';
export declare const clientIp: (req: Request) => string | undefined;
declare class SetSignatureBody {
    signatureData: string;
}
declare class SignBody {
    motherProfileId: string;
    date: string;
    shift: CareSignShift;
}
declare class LinkBody {
    motherProfileId: string;
}
declare class VerifyBody {
    phoneLast4: string;
}
declare class ConfirmBody {
    viewToken: string;
    items: {
        date: string;
        satisfaction: number;
        comment?: string;
        nurseRatings?: {
            signatureId: string;
            score: number;
        }[];
    }[];
    method: CareConfirmMethod;
    signatureData?: string;
    holdMs?: number;
    deviceId?: string;
    acknowledged: boolean;
}
export declare class MySignatureController {
    private readonly service;
    constructor(service: CareSignatureService);
    get(): unknown;
    set(dto: SetSignatureBody): unknown;
}
export declare class CareSignatureController {
    private readonly service;
    constructor(service: CareSignatureService);
    overview(motherProfileId: string): unknown;
    status(motherProfileId: string, date: string): unknown;
    sign(dto: SignBody, deviceId?: string): unknown;
    unsign(id: string): unknown;
    createLink(dto: LinkBody): unknown;
    links(motherProfileId: string): unknown;
    revoke(id: string): unknown;
}
export declare class PublicCareConfirmController {
    private readonly service;
    constructor(service: CareConfirmPublicService);
    info(token: string): unknown;
    verify(token: string, dto: VerifyBody): unknown;
    days(token: string, session?: string): unknown;
    confirm(token: string, dto: ConfirmBody, req: Request, session?: string): unknown;
}
export {};
