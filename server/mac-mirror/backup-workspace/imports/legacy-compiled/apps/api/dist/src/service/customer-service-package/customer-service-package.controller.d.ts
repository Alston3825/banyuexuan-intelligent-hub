import { CustomerServicePackageService } from './customer-service-package.service';
import { CreateCustomerServicePackageDto } from './dto/create-customer-service-package.dto';
import { QueryCustomerServicePackageDto } from './dto/query-customer-service-package.dto';
import { QueryCustomerServicePackageReportDto } from './dto/query-customer-service-package-report.dto';
export declare class CustomerServicePackageController {
    private readonly customerServicePackageService;
    constructor(customerServicePackageService: CustomerServicePackageService);
    findAll(query: QueryCustomerServicePackageDto): any;
    report(query: QueryCustomerServicePackageReportDto): Promise<import("./customer-service-package.service").CustomerServicePackageReport>;
    findOne(id: string): unknown;
    create(dto: CreateCustomerServicePackageDto): Promise<CustomerServicePackage>;
}
