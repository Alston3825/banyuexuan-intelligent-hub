export type CellValue = string | number | null;
export interface XlsxSheet {
    name: string;
    rows: CellValue[][];
}
export declare function readZip(buf: Buffer): Map<string, Buffer>;
export declare function readXlsx(buf: Buffer): XlsxSheet[];
