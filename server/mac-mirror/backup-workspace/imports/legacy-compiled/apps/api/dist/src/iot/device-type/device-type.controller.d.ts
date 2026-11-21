import { DeviceTypeService } from './device-type.service';
import { CreateDeviceTypeDto } from './dto/create-device-type.dto';
import { UpdateDeviceTypeDto } from './dto/update-device-type.dto';
export declare class DeviceTypeController {
    private readonly deviceTypeService;
    constructor(deviceTypeService: DeviceTypeService);
    findAll(): Promise<{}>;
    findOne(id: string): Promise<T>;
    create(dto: CreateDeviceTypeDto): Promise<T>;
    update(id: string, dto: UpdateDeviceTypeDto): Promise<T>;
}
