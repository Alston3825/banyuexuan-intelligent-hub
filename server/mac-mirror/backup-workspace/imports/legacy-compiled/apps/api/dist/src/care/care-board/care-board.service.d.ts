import { PrismaService } from '../../prisma/prisma.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { RoomService, RoomBoardEntry } from '../../room/room/room.service';
import { QueryCareBoardDto } from './dto/query-care-board.dto';
export interface CareBoardBaby {
    id: string;
    sequenceNo: number;
    name: string | null;
    gender: 'MALE' | 'FEMALE' | 'UNKNOWN';
}
export interface CareBoardCare {
    motherProfileId: string;
    deliveryMethod: 'VAGINAL' | 'CESAREAN' | 'UNKNOWN';
    deliveryDate: Date | null;
    gestationalWeeks: number | null;
    careNote: string | null;
    nurse: {
        id: string;
        name: string;
    } | null;
    hasAllergyTag: boolean;
    allergyNote: string | null;
    plan: {
        level: string;
        focusPoints: string | null;
        nextReviewDue: string | null;
        reviewOverdue: boolean;
    } | null;
    dailyFilledToday: boolean;
    babies: CareBoardBaby[];
}
export interface CareBoardEntry extends RoomBoardEntry {
    care: CareBoardCare | null;
}
export declare class CareBoardService {
    private readonly prisma;
    private readonly roomService;
    private readonly ctx;
    constructor(prisma: PrismaService, roomService: RoomService, ctx: RequestContextService);
    getBoard(query: QueryCareBoardDto): Promise<CareBoardEntry[]>;
    private allergyOf;
}
