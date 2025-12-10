import { CreateFolderDto } from './create-folder.dto';
declare const UpdateFolderDto_base: import("@nestjs/mapped-types").MappedType<Partial<Omit<CreateFolderDto, "space_id">>>;
export declare class UpdateFolderDto extends UpdateFolderDto_base {
}
export {};
