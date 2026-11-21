import { CustomerChannelService, CustomerChannelTypeService } from './customer-channel.service';
import { CreateChannelTypeDto, CreateCustomerChannelDto, QueryCustomerChannelDto, UpdateChannelTypeDto, UpdateCustomerChannelDto } from './dto/customer-channel.dto';
export declare class CustomerChannelController {
    private readonly channelService;
    private readonly typeService;
    constructor(channelService: CustomerChannelService, typeService: CustomerChannelTypeService);
    findTypes(): unknown;
    createType(dto: CreateChannelTypeDto): Promise<CustomerChannelType>;
    updateType(id: string, dto: UpdateChannelTypeDto): Promise<CustomerChannelType>;
    removeType(id: string): Promise<void>;
    findAll(query: QueryCustomerChannelDto): unknown;
    create(dto: CreateCustomerChannelDto): Promise<CustomerChannel>;
    update(id: string, dto: UpdateCustomerChannelDto): Promise<CustomerChannel>;
    remove(id: string): Promise<void>;
}
