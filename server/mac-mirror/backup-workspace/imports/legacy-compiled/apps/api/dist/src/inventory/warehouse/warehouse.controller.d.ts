import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { QueryWarehouseDto } from './dto/query-warehouse.dto';
export declare class WarehouseController {
    private readonly warehouseService;
    constructor(warehouseService: WarehouseService);
    findAll(query: QueryWarehouseDto): Promise<{}>;
    findOne(id: string): Promise<T>;
    create(dto: CreateWarehouseDto): Promise<T>;
    update(id: string, dto: UpdateWarehouseDto): Promise<T>;
}
