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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TasksService = class TasksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTaskDto) {
        const { list_id, ...data } = createTaskDto;
        const list = await this.prisma.list.findUnique({ where: { id: list_id } });
        if (!list) {
            throw new common_1.NotFoundException(`List with ID ${list_id} not found`);
        }
        return this.prisma.task.create({
            data: {
                ...data,
                list: { connect: { id: list_id } },
            },
        });
    }
    findAll(listId) {
        if (listId) {
            return this.prisma.task.findMany({
                where: { list_id: listId },
                include: {
                    assignees: { include: { user: true } },
                    tags: { include: { tag: true } },
                },
            });
        }
        return this.prisma.task.findMany({
            include: {
                assignees: { include: { user: true } },
                tags: { include: { tag: true } },
            },
        });
    }
    findOne(id) {
        return this.prisma.task.findUnique({
            where: { id },
            include: {
                assignees: { include: { user: true } },
                tags: { include: { tag: true } },
            },
        });
    }
    update(id, updateTaskDto) {
        return this.prisma.task.update({
            where: { id },
            data: updateTaskDto,
        });
    }
    remove(id) {
        return this.prisma.task.delete({ where: { id } });
    }
    async addAssignee(taskId, addAssigneeDto) {
        return this.prisma.taskAssignee.create({
            data: {
                task: { connect: { id: taskId } },
                user: { connect: { id: addAssigneeDto.user_id } },
            },
        });
    }
    async removeAssignee(taskId, userId) {
        return this.prisma.taskAssignee.delete({
            where: {
                task_id_user_id: {
                    task_id: taskId,
                    user_id: userId,
                },
            },
        });
    }
    async addTag(taskId, addTagDto) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: { list: { include: { folder: true } } },
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        const spaceId = task.list.folder.space_id;
        let tag = await this.prisma.tag.findFirst({
            where: { space_id: spaceId, name: addTagDto.name },
        });
        if (!tag) {
            tag = await this.prisma.tag.create({
                data: {
                    name: addTagDto.name,
                    color: addTagDto.color,
                    space: { connect: { id: spaceId } },
                },
            });
        }
        return this.prisma.taskTag.create({
            data: {
                task: { connect: { id: taskId } },
                tag: { connect: { id: tag.id } },
            },
        });
    }
    async removeTag(taskId, tagId) {
        return this.prisma.taskTag.delete({
            where: {
                task_id_tag_id: {
                    task_id: taskId,
                    tag_id: tagId,
                },
            },
        });
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map