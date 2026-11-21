import { VehicleBookingService } from './vehicle-booking.service';
import { CreateVehicleBookingDto } from './dto/create-vehicle-booking.dto';
import { QueryVehicleBookingDto } from './dto/query-vehicle-booking.dto';
import { CancelVehicleBookingDto } from './dto/cancel-vehicle-booking.dto';
export declare class VehicleBookingController {
    private readonly vehicleBookingService;
    constructor(vehicleBookingService: VehicleBookingService);
    findAll(query: QueryVehicleBookingDto): Promise<{}>;
    findOne(id: string): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    create(dto: CreateVehicleBookingDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    cancel(id: string, dto: CancelVehicleBookingDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
}
