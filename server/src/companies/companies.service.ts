import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompaniesService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.company.findMany({
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar_url: true,
                                role: true
                            }
                        }
                    }
                }
            },
            orderBy: { name: 'asc' }
        });
    }

    async findOne(id: string) {
        const company = await this.prisma.company.findUnique({
            where: { id },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar_url: true,
                                role: true
                            }
                        }
                    }
                }
            }
        });

        if (!company) throw new NotFoundException('Company not found');
        return company;
    }

    async create(data: any) {
        const { members, ...companyData } = data;

        // Create company first
        const company = await this.prisma.company.create({
            data: {
                ...companyData,
                // If members are provided in create payload
                members: members ? {
                    create: members.map((m: any) => ({
                        user_id: m.userId,
                        role: m.role
                    }))
                } : undefined
            },
            include: {
                members: true
            }
        });

        return company;
    }

    async update(id: string, data: any) {
        const { members, ...companyData } = data;

        // Check if exists
        await this.findOne(id);

        return this.prisma.company.update({
            where: { id },
            data: companyData
        });
    }

    async addMember(companyId: string, userId: string, role: string) {
        // Check if exists
        await this.findOne(companyId);

        // Upsert member
        return this.prisma.companyMember.upsert({
            where: {
                company_id_user_id: {
                    company_id: companyId,
                    user_id: userId
                }
            },
            update: { role },
            create: {
                company_id: companyId,
                user_id: userId,
                role
            }
        });
    }

    async removeMember(companyId: string, userId: string) {
        return this.prisma.companyMember.delete({
            where: {
                company_id_user_id: {
                    company_id: companyId,
                    user_id: userId
                }
            }
        });
    }

    async remove(id: string) {
        // Check if exists
        await this.findOne(id);

        return this.prisma.company.delete({
            where: { id }
        });
    }

    // Helper for batch import
    async createWithMembers(name: string, members: Array<{ userId: string, role: string }>) {
        return this.prisma.company.create({
            data: {
                name,
                members: {
                    createMany: {
                        data: members.map(m => ({ user_id: m.userId, role: m.role }))
                    }
                }
            }
        });
    }
}
