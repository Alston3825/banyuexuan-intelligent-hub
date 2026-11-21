import { ServiceProductService } from './service-product.service';
import { CreateServiceProductDto } from './dto/create-service-product.dto';
import { UpdateServiceProductDto } from './dto/update-service-product.dto';
export declare class ServiceProductController {
    private readonly serviceProductService;
    constructor(serviceProductService: ServiceProductService);
    findAll(): Promise<{}>;
    findOne(id: string): Promise<T>;
    create(dto: CreateServiceProductDto): Promise<T>;
    update(id: string, dto: UpdateServiceProductDto): Promise<T>;
}
