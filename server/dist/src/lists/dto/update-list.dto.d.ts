import { CreateListDto } from './create-list.dto';
declare const UpdateListDto_base: import("@nestjs/mapped-types").MappedType<Partial<Omit<CreateListDto, "folder_id">>>;
export declare class UpdateListDto extends UpdateListDto_base {
}
export {};
