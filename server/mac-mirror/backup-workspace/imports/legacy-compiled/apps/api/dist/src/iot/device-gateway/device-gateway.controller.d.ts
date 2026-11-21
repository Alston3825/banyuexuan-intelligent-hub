import { DeviceGatewayService } from './device-gateway.service';
import { ReportDeviceEventDto } from './dto/report-device-event.dto';
import { IssueDeviceCommandDto } from './dto/issue-device-command.dto';
export declare class DeviceGatewayController {
    private readonly deviceGatewayService;
    constructor(deviceGatewayService: DeviceGatewayService);
    findEvents(deviceId?: string, storeId?: string): Promise<{}>;
    reportEvent(dto: ReportDeviceEventDto): Promise<DeviceEvent>;
    getShadow(deviceId: string): Promise<DeviceShadow>;
    issueCommand(deviceId: string, dto: IssueDeviceCommandDto): Promise<DeviceShadow>;
    confirmCommand(deviceId: string): Promise<DeviceShadow>;
}
