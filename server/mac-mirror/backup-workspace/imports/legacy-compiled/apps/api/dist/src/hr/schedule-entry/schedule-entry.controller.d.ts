import { ScheduleEntryService } from './schedule-entry.service';
import { CreateScheduleEntryDto } from './dto/create-schedule-entry.dto';
import { UpdateScheduleEntryDto } from './dto/update-schedule-entry.dto';
import { QueryScheduleEntryDto } from './dto/query-schedule-entry.dto';
export declare class ScheduleEntryController {
    private readonly scheduleEntryService;
    constructor(scheduleEntryService: ScheduleEntryService);
    findAll(query: QueryScheduleEntryDto): any;
    create(dto: CreateScheduleEntryDto): Promise<ScheduleEntry>;
    update(id: string, dto: UpdateScheduleEntryDto): Promise<ScheduleEntry>;
    delete(id: string): Promise<void>;
}
