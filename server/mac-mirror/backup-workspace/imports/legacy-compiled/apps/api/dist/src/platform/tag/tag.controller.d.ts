import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { BindTagDto } from './dto/bind-tag.dto';
export declare class TagController {
    private readonly tagService;
    constructor(tagService: TagService);
    findAll(): Promise<{}>;
    findOne(id: string): Promise<T>;
    create(dto: CreateTagDto): Promise<Tag>;
    update(id: string, dto: UpdateTagDto): Promise<T>;
    remove(id: string): Promise<void>;
    bind(id: string, dto: BindTagDto): unknown;
}
