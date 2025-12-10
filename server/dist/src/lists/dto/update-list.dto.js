"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateListDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_list_dto_1 = require("./create-list.dto");
const mapped_types_2 = require("@nestjs/mapped-types");
class UpdateListDto extends (0, mapped_types_1.PartialType)((0, mapped_types_2.OmitType)(create_list_dto_1.CreateListDto, ['folder_id'])) {
}
exports.UpdateListDto = UpdateListDto;
//# sourceMappingURL=update-list.dto.js.map