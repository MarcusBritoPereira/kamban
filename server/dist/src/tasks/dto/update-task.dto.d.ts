import { CreateTaskDto } from './create-task.dto';
declare const UpdateTaskDto_base: import("@nestjs/mapped-types").MappedType<Partial<Omit<CreateTaskDto, "list_id">>>;
export declare class UpdateTaskDto extends UpdateTaskDto_base {
}
export {};
