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
exports.SpacesController = void 0;
const common_1 = require("@nestjs/common");
const spaces_service_1 = require("./spaces.service");
const create_space_dto_1 = require("./dto/create-space.dto");
const update_space_dto_1 = require("./dto/update-space.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
const permissions_service_1 = require("../permissions/permissions.service");
let SpacesController = class SpacesController {
    spacesService;
    permissionsService;
    constructor(spacesService, permissionsService) {
        this.spacesService = spacesService;
        this.permissionsService = permissionsService;
    }
    create(createSpaceDto, req) {
        const user = req.user;
        return this.spacesService.create(createSpaceDto, user.sub);
    }
    findAll(req) {
        const user = req.user;
        return this.spacesService.findAll(user.sub, user.role);
    }
    async findOne(id, req) {
        const user = req.user;
        const hasAccess = await this.permissionsService.hasAccess(user.sub, id, permissions_service_1.SpaceRole.VIEWER);
        if (!hasAccess)
            throw new common_1.ForbiddenException('You do not have access to this space');
        return this.spacesService.findOne(id);
    }
    async invite(id, email, req) {
        const user = req.user;
        const hasAccess = await this.permissionsService.hasAccess(user.sub, id, permissions_service_1.SpaceRole.ADMIN);
        if (!hasAccess)
            throw new common_1.ForbiddenException('Only Admins or Owners can invite members');
        try {
            return await this.spacesService.addMember(id, email);
        }
        catch (error) {
            const err = error;
            if (err.message && err.message.includes('User not found')) {
                throw new common_1.NotFoundException(err.message);
            }
            throw error;
        }
    }
    async update(id, updateSpaceDto, req) {
        const user = req.user;
        const hasAccess = await this.permissionsService.hasAccess(user.sub, id, permissions_service_1.SpaceRole.EDITOR);
        if (!hasAccess)
            throw new common_1.ForbiddenException('Insufficient permissions update this space');
        return this.spacesService.update(id, updateSpaceDto);
    }
    async remove(id, req) {
        const user = req.user;
        const hasAccess = await this.permissionsService.hasAccess(user.sub, id, permissions_service_1.SpaceRole.OWNER);
        if (!hasAccess)
            throw new common_1.ForbiddenException('Only the Owner can delete this space');
        return this.spacesService.remove(id);
    }
};
exports.SpacesController = SpacesController;
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.admin, client_1.Role.gestor),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_space_dto_1.CreateSpaceDto, Object]),
    __metadata("design:returntype", void 0)
], SpacesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SpacesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SpacesController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.admin, client_1.Role.gestor),
    (0, common_1.Post)(':id/members'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('email')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SpacesController.prototype, "invite", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.admin),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_space_dto_1.UpdateSpaceDto, Object]),
    __metadata("design:returntype", Promise)
], SpacesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SpacesController.prototype, "remove", null);
exports.SpacesController = SpacesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('v1/spaces'),
    __metadata("design:paramtypes", [spaces_service_1.SpacesService,
        permissions_service_1.PermissionsService])
], SpacesController);
//# sourceMappingURL=spaces.controller.js.map