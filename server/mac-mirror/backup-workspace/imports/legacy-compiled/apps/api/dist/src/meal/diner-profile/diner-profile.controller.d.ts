import { DinerProfileService } from './diner-profile.service';
import { CreateDinerProfileDto } from './dto/create-diner-profile.dto';
import { QueryDinerProfileDto } from './dto/query-diner-profile.dto';
export declare class DinerProfileController {
    private readonly dinerProfileService;
    constructor(dinerProfileService: DinerProfileService);
    findAll(query: QueryDinerProfileDto): Promise<{}>;
    findOne(id: string): unknown;
    create(dto: CreateDinerProfileDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    end(id: string): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
}
