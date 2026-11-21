import { MealItemService } from './meal-item.service';
import { CreateMealItemDto } from './dto/create-meal-item.dto';
import { UpdateMealItemDto } from './dto/update-meal-item.dto';
export declare class MealItemController {
    private readonly mealItemService;
    constructor(mealItemService: MealItemService);
    findAll(): Promise<{}>;
    findOne(id: string): Promise<T>;
    create(dto: CreateMealItemDto): Promise<T>;
    update(id: string, dto: UpdateMealItemDto): Promise<T>;
}
