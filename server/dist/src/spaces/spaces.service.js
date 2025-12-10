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
exports.SpacesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SpacesService = class SpacesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(createSpaceDto, ownerId) {
        return this.prisma.space.create({
            data: {
                ...createSpaceDto,
                owner_id: ownerId,
            },
        });
    }
    async findAll(userId, userRole) {
        if (userRole === 'admin') {
            return this.prisma.space.findMany({
                include: {
                    tags: true,
                    owner: {
                        select: { name: true, email: true },
                    },
                    members: {
                        include: {
                            user: {
                                select: { name: true, email: true },
                            },
                        },
                    },
                },
            });
        }
        return this.prisma.space.findMany({
            where: {
                OR: [
                    { owner_id: userId },
                    {
                        members: {
                            some: {
                                user_id: userId,
                            },
                        },
                    },
                ],
            },
            include: {
                tags: true,
                owner: {
                    select: { name: true, email: true },
                },
                members: {
                    include: {
                        user: {
                            select: { name: true, email: true },
                        },
                    },
                },
            },
        });
    }
    async addMember(spaceId, email) {
        const userToAdd = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!userToAdd) {
            throw new Error('User not found');
        }
        return this.prisma.spaceMember.create({
            data: {
                space_id: spaceId,
                user_id: userToAdd.id,
                role: 'editor',
            },
        });
    }
    findOne(id) {
        return this.prisma.space.findUnique({ where: { id } });
    }
    update(id, updateSpaceDto) {
        return this.prisma.space.update({
            where: { id },
            data: updateSpaceDto,
        });
    }
    remove(id) {
        return this.prisma.space.delete({ where: { id } });
    }
};
exports.SpacesService = SpacesService;
exports.SpacesService = SpacesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SpacesService);
//# sourceMappingURL=spaces.service.js.map