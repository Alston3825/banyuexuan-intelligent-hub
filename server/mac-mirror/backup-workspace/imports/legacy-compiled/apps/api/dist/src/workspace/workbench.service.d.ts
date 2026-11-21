import { PrismaService } from '../prisma/prisma.service';
import { RequestContextService } from '../common/context/request-context.service';
interface ReminderRow {
    repeat: string;
    startDate: string;
    weekday: number | null;
    monthDay: number | null;
}
export declare function reminderDueOn(r: ReminderRow, date: string): boolean;
export declare class WorkbenchService {
    private readonly prisma;
    private readonly ctx;
    constructor(prisma: PrismaService, ctx: RequestContextService);
    private get me();
    private clean;
    tasks(): unknown;
    createTask(dto: {
        title?: string;
        note?: string;
        quadrant?: string;
    }): unknown;
    updateTask(id: string, dto: {
        title?: string;
        note?: string;
        quadrant?: string;
        done?: boolean;
    }): unknown;
    deleteTask(id: string): unknown;
    remindersForDay(date?: string): unknown;
    reminderDefs(): unknown;
    private reminderData;
    createReminder(dto: Parameters<WorkbenchService['reminderData']>[0]): unknown;
    updateReminder(id: string, dto: Parameters<WorkbenchService['reminderData']>[0]): unknown;
    deleteReminder(id: string): unknown;
    markReminder(id: string, dto: {
        date?: string;
        done?: boolean;
    }): unknown;
    reminderBadge(): unknown;
    ongoing(): unknown;
    createOngoing(dto: {
        title?: string;
        note?: string;
        steps?: string[];
    }): unknown;
    private ownWork;
    updateOngoing(id: string, dto: {
        title?: string;
        note?: string;
        finished?: boolean;
    }): unknown;
    deleteOngoing(id: string): unknown;
    addStep(id: string, dto: {
        title?: string;
    }): unknown;
    updateStep(id: string, stepId: string, dto: {
        title?: string;
        result?: string;
        done?: boolean;
    }): unknown;
    deleteStep(id: string, stepId: string): unknown;
    myTheme(): unknown;
    saveTheme(dto: {
        theme?: string;
    }): unknown;
    links(): unknown;
    saveLinks(dto: {
        links?: {
            path: string;
            label: string;
        }[];
    }): unknown;
}
export {};
