import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
export declare class TeamController {
    private readonly teamService;
    constructor(teamService: TeamService);
    findAll(): Promise<{}>;
    findOne(id: string): Promise<T>;
    create(dto: CreateTeamDto): Promise<Team>;
    update(id: string, dto: UpdateTeamDto): Promise<T>;
    remove(id: string): Promise<void>;
}
