"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksController = void 0;
const common_1 = require("@nestjs/common");
const tasks_service_1 = require("./tasks.service");
const create_task_dto_1 = require("./dto/create-task.dto");
const update_task_dto_1 = require("./dto/update-task.dto");
const add_assignee_dto_1 = require("./dto/add-assignee.dto");
const add_tag_dto_1 = require("./dto/add-tag.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
let TasksController = class TasksController {
    tasksService;
    constructor(tasksService) {
        this.tasksService = tasksService;
    }
    create(listId, createTaskDto) {
        createTaskDto.list_id = listId;
        return this.tasksService.create(createTaskDto);
    }
    findAllByList(listId) {
        return this.tasksService.findAll(listId);
    }
    findOne(id) {
        return this.tasksService.findOne(id);
    }
    update(id, updateTaskDto) {
        return this.tasksService.update(id, updateTaskDto);
    }
    remove(id) {
        return this.tasksService.remove(id);
    }
    addAssignee(id, addAssigneeDto) {
        return this.tasksService.addAssignee(id, addAssigneeDto);
    }
    removeAssignee(taskId, userId) {
        return this.tasksService.removeAssignee(taskId, userId);
    }
    addTag(id, addTagDto) {
        return this.tasksService.addTag(id, addTagDto);
    }
    removeTag(taskId, tagId) {
        return this.tasksService.removeTag(taskId, tagId);
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.admin, client_1.Role.gestor, client_1.Role.editor),
    (0, common_1.Post)('lists/:listId/tasks'),
    __param(0, (0, common_1.Param)('listId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_task_dto_1.CreateTaskDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('lists/:listId/tasks'),
    __param(0, (0, common_1.Param)('listId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "findAllByList", null);
__decorate([
    (0, common_1.Get)('tasks/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.admin, client_1.Role.gestor, client_1.Role.editor),
    (0, common_1.Patch)('tasks/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_task_dto_1.UpdateTaskDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.admin, client_1.Role.gestor),
    (0, common_1.Delete)('tasks/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "remove", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.admin, client_1.Role.gestor),
    (0, common_1.Post)('tasks/:id/assignees'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_assignee_dto_1.AddAssigneeDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "addAssignee", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.admin, client_1.Role.gestor),
    (0, common_1.Delete)('tasks/:taskId/assignees/:userId'),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "removeAssignee", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.admin, client_1.Role.gestor, client_1.Role.editor),
    (0, common_1.Post)('tasks/:id/tags'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_tag_dto_1.AddTagDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "addTag", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.admin, client_1.Role.gestor, client_1.Role.editor),
    (0, common_1.Delete)('tasks/:taskId/tags/:tagId'),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, common_1.Param)('tagId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "removeTag", null);
exports.TasksController = TasksController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('v1'),
    __metadata("design:paramtypes", [tasks_service_1.TasksService])
], TasksController);
//# sourceMappingURL=tasks.controller.js.map