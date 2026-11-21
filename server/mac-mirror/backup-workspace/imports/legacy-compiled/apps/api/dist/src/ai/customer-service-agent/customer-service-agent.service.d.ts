import { AiSuggestion } from '@prisma/client';
import { LeadService } from '../../crm/lead/lead.service';
import { CustomerService } from '../../crm/customer/customer.service';
import { FollowUpService } from '../../crm/follow-up/follow-up.service';
import { AiGatewayClient } from '../ai-gateway/ai-gateway.client';
import { AiSuggestionService } from '../ai-suggestion/ai-suggestion.service';
import { KnowledgeRetrievalService } from '../knowledge-retrieval/knowledge-retrieval.service';
import { AskCustomerServiceDto } from './dto/ask-customer-service.dto';
export interface CustomerServiceAnswer {
    suggestion: AiSuggestion;
    answer: string;
    escalate: boolean;
}
export declare class CustomerServiceAgentService {
    private readonly leadService;
    private readonly customerService;
    private readonly followUpService;
    private readonly aiGatewayClient;
    private readonly aiSuggestionService;
    private readonly knowledgeRetrievalService;
    constructor(leadService: LeadService, customerService: CustomerService, followUpService: FollowUpService, aiGatewayClient: AiGatewayClient, aiSuggestionService: AiSuggestionService, knowledgeRetrievalService: KnowledgeRetrievalService);
    ask(dto: AskCustomerServiceDto): Promise<CustomerServiceAnswer>;
    private buildKnowledgeContext;
    private buildContext;
}
