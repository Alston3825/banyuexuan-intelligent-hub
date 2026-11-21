export type AssessmentType = 'MOTHER_ADMISSION' | 'BABY_ADMISSION' | 'MOTHER_DISCHARGE' | 'BABY_DISCHARGE';
export declare const ASSESSMENT_TYPES: AssessmentType[];
export type FieldKind = 'text' | 'longtext' | 'int' | 'decimal' | 'date' | 'single' | 'multi';
export interface Opt {
    value: string;
    label: string;
}
export interface FieldSpec {
    key: string;
    label: string;
    kind: FieldKind;
    options?: Opt[];
    unit?: string;
    min?: number;
    max?: number;
    hint?: string;
    aiHint?: string;
}
export interface GroupSpec {
    title: string;
    fields: FieldSpec[];
}
export interface FormSpec {
    type: AssessmentType;
    title: string;
    subject: 'MOTHER' | 'BABY';
    model: 'careMotherAdmission' | 'careBabyAdmission' | 'careMotherDischarge' | 'careBabyDischarge';
    aiDescription: string;
    groups: GroupSpec[];
}
export declare const o: (value: string, label: string) => Opt;
export declare const YES_NO: {};
export declare const NORMAL_ABNORMAL: {};
export declare const LOCHIA_AMOUNT: {};
export declare const LOCHIA_COLOR: {};
export declare const LOCHIA_ODOR: {};
export declare const text: (key: string, label: string, extra?: Partial<FieldSpec>) => FieldSpec;
export declare const longtext: (key: string, label: string, extra?: Partial<FieldSpec>) => FieldSpec;
export declare const int: (key: string, label: string, extra?: Partial<FieldSpec>) => FieldSpec;
export declare const dec: (key: string, label: string, extra?: Partial<FieldSpec>) => FieldSpec;
export declare const date: (key: string, label: string, extra?: Partial<FieldSpec>) => FieldSpec;
export declare const single: (key: string, label: string, options: Opt[], extra?: Partial<FieldSpec>) => FieldSpec;
export declare const multi: (key: string, label: string, options: Opt[], extra?: Partial<FieldSpec>) => FieldSpec;
export declare const FORM_SPECS: Record<AssessmentType, FormSpec>;
export declare const allFields: (spec: FormSpec) => FieldSpec[];
export declare const columnName: (key: string) => string;
