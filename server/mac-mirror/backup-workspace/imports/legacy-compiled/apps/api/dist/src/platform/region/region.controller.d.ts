import { RegionService } from './region.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
export declare class RegionController {
    private readonly regionService;
    constructor(regionService: RegionService);
    findAll(): Promise<{}>;
    findOne(id: string): Promise<T>;
    create(dto: CreateRegionDto): Promise<Region>;
    update(id: string, dto: UpdateRegionDto): Promise<T>;
    remove(id: string): Promise<void>;
}
