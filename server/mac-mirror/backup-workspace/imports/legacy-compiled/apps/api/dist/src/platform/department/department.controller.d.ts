import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
export declare class DepartmentController {
    private readonly departmentService;
    constructor(departmentService: DepartmentService);
    findAll(): Promise<{}>;
    findOne(id: string): Promise<T>;
    create(dto: CreateDepartmentDto): Promise<Department>;
    update(id: string, dto: UpdateDepartmentDto): Promise<T>;
    remove(id: string): Promise<void>;
}
