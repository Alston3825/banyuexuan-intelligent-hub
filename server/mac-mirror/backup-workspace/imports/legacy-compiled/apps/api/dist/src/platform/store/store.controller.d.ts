import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { CloseStoreDto } from './dto/close-store.dto';
export declare class StoreController {
    private readonly storeService;
    constructor(storeService: StoreService);
    findAll(): Promise<{}>;
    findOne(id: string): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    create(dto: CreateStoreDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    update(id: string, dto: UpdateStoreDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    close(id: string, dto: CloseStoreDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
}
