import { FieldSpec } from '../care-assessment/assessment-specs';
export declare const SHEET_SERVICE_CODES: any;
export declare const sheetRowLabel: (code: string) => any;
declare const nameOf: (code: string) => any;
export declare const SHEET_HEADER_FIELDS: FieldSpec[];
export declare const SHEET_ENTRY_COLUMNS: FieldSpec[];
export declare const SHEET_AI_DESCRIPTION: string;
export declare function serviceSheetAiSpec(): {
    formTitle: string;
    description: string;
    fields: {};
};
export { nameOf as serviceNameOf };
