import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { QueryDeviceDto } from './dto/query-device.dto';
export declare class DeviceController {
    private readonly deviceService;
    constructor(deviceService: DeviceService);
    findAll(query: QueryDeviceDto): Promise<{}>;
    findOne(id: string): Promise<T>;
    create(dto: CreateDeviceDto): Promise<Device>;
    update(id: string, dto: UpdateDeviceDto): Promise<T>;
}
