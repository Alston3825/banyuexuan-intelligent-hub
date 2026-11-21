import { ServiceAppointmentService } from './service-appointment.service';
import { CreateServiceAppointmentDto } from './dto/create-service-appointment.dto';
import { QueryServiceAppointmentDto } from './dto/query-service-appointment.dto';
import { CancelServiceAppointmentDto } from './dto/cancel-service-appointment.dto';
import { FeedbackServiceAppointmentDto } from './dto/feedback-service-appointment.dto';
import { VersionDto } from './dto/version.dto';
import { QueryServiceReportDto } from './dto/query-service-report.dto';
export declare class ServiceAppointmentController {
    private readonly serviceAppointmentService;
    constructor(serviceAppointmentService: ServiceAppointmentService);
    findAll(query: QueryServiceAppointmentDto): any;
    report(query: QueryServiceReportDto): Promise<import("./service-appointment.service").ServiceAppointmentReport>;
    findOne(id: string): unknown;
    create(dto: CreateServiceAppointmentDto): Promise<ServiceAppointment>;
    complete(id: string, dto: VersionDto): Promise<ServiceAppointment>;
    cancel(id: string, dto: CancelServiceAppointmentDto): Promise<ServiceAppointment>;
    feedback(id: string, dto: FeedbackServiceAppointmentDto): Promise<ServiceAppointment>;
}
