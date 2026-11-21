import { PositionService } from './position.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
export declare class PositionController {
    private readonly positionService;
    constructor(positionService: PositionService);
    findAll(): Promise<{}>;
    findOne(id: string): Promise<T>;
    create(dto: CreatePositionDto): Promise<Position>;
    update(id: string, dto: UpdatePositionDto): Promise<T>;
    remove(id: string): Promise<void>;
}
