"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTaskDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_task_dto_1 = require("./create-task.dto");
const mapped_types_2 = require("@nestjs/mapped-types");
class UpdateTaskDto extends (0, mapped_types_1.PartialType)((0, mapped_types_2.OmitType)(create_task_dto_1.CreateTaskDto, ['list_id'])) {
}
exports.UpdateTaskDto = UpdateTaskDto;
//# sourceMappingURL=update-task.dto.js.map