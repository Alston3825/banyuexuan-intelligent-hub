import { TherapistService } from './therapist.service';
import { CreateTherapistDto } from './dto/create-therapist.dto';
import { UpdateTherapistDto } from './dto/update-therapist.dto';
import { QueryTherapistDto } from './dto/query-therapist.dto';
export declare class TherapistController {
    private readonly therapistService;
    constructor(therapistService: TherapistService);
    findAll(query: QueryTherapistDto): Promise<{}>;
    findOne(id: string): Promise<T>;
    create(dto: CreateTherapistDto): Promise<T>;
    update(id: string, dto: UpdateTherapistDto): Promise<T>;
}
