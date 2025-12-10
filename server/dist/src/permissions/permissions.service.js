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
exports.PermissionsService = exports.SpaceRole = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
var SpaceRole;
(function (SpaceRole) {
    SpaceRole["OWNER"] = "owner";
    SpaceRole["ADMIN"] = "admin";
    SpaceRole["EDITOR"] = "editor";
    SpaceRole["VIEWER"] = "viewer";
})(SpaceRole || (exports.SpaceRole = SpaceRole = {}));
let PermissionsService = class PermissionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    roleHierarchy = {
        [SpaceRole.OWNER]: 4,
        [SpaceRole.ADMIN]: 3,
        [SpaceRole.EDITOR]: 2,
        [SpaceRole.VIEWER]: 1,
    };
    async getSpaceRole(userId, spaceId) {
        const space = await this.prisma.space.findUnique({
            where: { id: spaceId },
            include: {
                members: {
                    where: { user_id: userId },
                },
            },
        });
        if (!space)
            return null;
        if (space.owner_id === userId) {
            return SpaceRole.OWNER;
        }
        if (space.members.length > 0) {
            const roleStr = space.members[0].role;
            return roleStr;
        }
        return null;
    }
    async hasAccess(userId, spaceId, requiredRole) {
        const userRole = await this.getSpaceRole(userId, spaceId);
        if (!userRole)
            return false;
        const userLevel = this.roleHierarchy[userRole] || 0;
        const requiredLevel = this.roleHierarchy[requiredRole] || 0;
        return userLevel >= requiredLevel;
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PermissionsService);
//# sourceMappingURL=permissions.service.js.map