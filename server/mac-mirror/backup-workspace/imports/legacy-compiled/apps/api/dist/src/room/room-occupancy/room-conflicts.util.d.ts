export interface ConflictOccupancy {
    id: string;
    roomId: string;
    occupancyNo: string;
    status: 'RESERVED' | 'CHECKED_IN';
    plannedCheckIn: Date;
    plannedCheckOut: Date;
    createdAt: Date;
    contractId: string | null;
    contractStatus?: string | null;
    customerName: string;
    roomNo: string;
}
export interface RoomConflict {
    roomId: string;
    roomNo: string;
    a: ConflictBrief;
    b: ConflictBrief;
    overlapDays: number;
    bufferOnly: boolean;
    startsInDays: number;
    suggestId: string;
}
export interface ConflictBrief {
    id: string;
    occupancyNo: string;
    customerName: string;
    status: 'RESERVED' | 'CHECKED_IN';
    plannedCheckIn: Date;
    plannedCheckOut: Date;
    priority: 'SIGNED' | 'INTENT';
}
export declare const brief: (o: ConflictOccupancy) => ConflictBrief;
export declare function overlapsWithBuffer(aIn: Date, aOut: Date, bIn: Date, bOut: Date, bufferDays: number): boolean;
export declare function computeConflicts(rows: ConflictOccupancy[], bufferDays: number, now?: any): RoomConflict[];
