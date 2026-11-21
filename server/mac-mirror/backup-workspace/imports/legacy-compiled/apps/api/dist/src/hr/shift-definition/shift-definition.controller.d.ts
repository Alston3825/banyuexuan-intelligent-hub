import { ShiftDefinitionService } from './shift-definition.service';
import { CreateShiftDefinitionDto } from './dto/create-shift-definition.dto';
import { UpdateShiftDefinitionDto } from './dto/update-shift-definition.dto';
import { QueryShiftDefinitionDto } from './dto/query-shift-definition.dto';
export declare class ShiftDefinitionController {
    private readonly shiftDefinitionService;
    constructor(shiftDefinitionService: ShiftDefinitionService);
    findAll(query: QueryShiftDefinitionDto): Promise<{}>;
    findOne(id: string): Promise<T>;
    create(dto: CreateShiftDefinitionDto): Promise<T>;
    update(id: string, dto: UpdateShiftDefinitionDto): Promise<T>;
}
