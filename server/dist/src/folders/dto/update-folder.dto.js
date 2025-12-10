"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFolderDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_folder_dto_1 = require("./create-folder.dto");
const mapped_types_2 = require("@nestjs/mapped-types");
class UpdateFolderDto extends (0, mapped_types_1.PartialType)((0, mapped_types_2.OmitType)(create_folder_dto_1.CreateFolderDto, ['space_id'])) {
}
exports.UpdateFolderDto = UpdateFolderDto;
//# sourceMappingURL=update-folder.dto.js.map