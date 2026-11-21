export interface IdCardCheck {
    valid: boolean;
    normalized: string;
    birthday: string | null;
    gender: 'MALE' | 'FEMALE' | null;
    reason?: string;
}
export declare function checkIdCard(raw: string): IdCardCheck;
