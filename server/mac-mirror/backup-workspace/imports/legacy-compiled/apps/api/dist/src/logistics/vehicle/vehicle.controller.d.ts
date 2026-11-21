import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
export declare class VehicleController {
    private readonly vehicleService;
    constructor(vehicleService: VehicleService);
    findAll(): Promise<{}>;
    findOne(id: string): Promise<T>;
    create(dto: CreateVehicleDto): Promise<T>;
    update(id: string, dto: UpdateVehicleDto): Promise<T>;
}
