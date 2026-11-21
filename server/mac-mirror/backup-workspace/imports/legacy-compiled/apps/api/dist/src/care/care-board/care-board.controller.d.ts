import { CareBoardService } from './care-board.service';
import { QueryCareBoardDto } from './dto/query-care-board.dto';
export declare class CareBoardController {
    private readonly careBoardService;
    constructor(careBoardService: CareBoardService);
    getBoard(query: QueryCareBoardDto): Promise<{}>;
}
