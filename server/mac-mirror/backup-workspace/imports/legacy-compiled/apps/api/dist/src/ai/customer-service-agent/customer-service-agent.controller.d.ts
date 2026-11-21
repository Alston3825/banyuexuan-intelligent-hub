import { CustomerServiceAgentService } from './customer-service-agent.service';
import { AskCustomerServiceDto } from './dto/ask-customer-service.dto';
export declare class CustomerServiceAgentController {
    private readonly customerServiceAgentService;
    constructor(customerServiceAgentService: CustomerServiceAgentService);
    ask(dto: AskCustomerServiceDto): Promise<import("./customer-service-agent.service").CustomerServiceAnswer>;
}
