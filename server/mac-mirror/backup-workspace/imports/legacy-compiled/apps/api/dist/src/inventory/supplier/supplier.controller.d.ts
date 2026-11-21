import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
export declare class SupplierController {
    private readonly supplierService;
    constructor(supplierService: SupplierService);
    findAll(): Promise<{}>;
    findOne(id: string): Promise<T>;
    create(dto: CreateSupplierDto): Promise<T>;
    update(id: string, dto: UpdateSupplierDto): Promise<T>;
}
