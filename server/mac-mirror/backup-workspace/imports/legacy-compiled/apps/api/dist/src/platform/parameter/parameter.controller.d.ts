import { ParameterService } from './parameter.service';
import { CreateParameterDto } from './dto/create-parameter.dto';
import { UpdateParameterDto } from './dto/update-parameter.dto';
export declare class ParameterController {
    private readonly parameterService;
    constructor(parameterService: ParameterService);
    findAll(): Promise<{}>;
    findOne(id: string): Promise<T>;
    create(dto: CreateParameterDto): Promise<Parameter>;
    update(id: string, dto: UpdateParameterDto): Promise<T>;
    remove(id: string): Promise<void>;
}
