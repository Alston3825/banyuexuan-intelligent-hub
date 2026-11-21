import { ServicePackageService } from './service-package.service';
import { CreateServicePackageDto } from './dto/create-service-package.dto';
import { UpdateServicePackageDto } from './dto/update-service-package.dto';
export declare class ServicePackageController {
    private readonly servicePackageService;
    constructor(servicePackageService: ServicePackageService);
    findAll(): Promise<{}>;
    findOne(id: string): Promise<T>;
    create(dto: CreateServicePackageDto): Promise<T>;
    update(id: string, dto: UpdateServicePackageDto): Promise<T>;
}
