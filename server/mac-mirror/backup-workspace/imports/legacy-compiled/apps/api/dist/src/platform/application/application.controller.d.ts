import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
export declare class ApplicationController {
    private readonly applicationService;
    constructor(applicationService: ApplicationService);
    findAll(): Promise<{}>;
    findOne(id: string): Promise<T>;
    create(dto: CreateApplicationDto): Promise<Application>;
    update(id: string, dto: UpdateApplicationDto): Promise<T>;
    remove(id: string): Promise<void>;
}
