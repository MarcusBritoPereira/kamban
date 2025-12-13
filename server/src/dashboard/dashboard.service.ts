
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getMetrics() {
        // 1. Active Companies Count & Total Value
        const activeCompanies = await this.prisma.company.findMany({
            where: { status: 'active' },
            select: { contract_value: true }
        });

        const totalActiveCompanies = activeCompanies.length;
        const totalActiveValue = activeCompanies.reduce((sum, company) => {
            return sum + (Number(company.contract_value) || 0);
        }, 0);

        // 2. Consultant Ranking
        // Find all 'Consultora de Marketing' members for active companies
        const consultants = await this.prisma.companyMember.findMany({
            where: {
                role: 'Consultora de Marketing',
                company: { status: 'active' }
            },
            include: {
                user: true,
                company: true
            }
        });

        // Group by User
        const consultantStats = new Map<string, {
            id: string;
            name: string;
            avatar_url: string | null;
            companies_count: number;
            total_managed_value: number;
            commission: number;
            // New field for detailed list
            active_companies: { id: string; name: string; value: number }[];
        }>();

        for (const record of consultants) {
            const userId = record.user_id;
            const contractValue = Number(record.company.contract_value) || 0;

            if (!consultantStats.has(userId)) {
                consultantStats.set(userId, {
                    id: userId,
                    name: record.user.name,
                    avatar_url: record.user.avatar_url,
                    companies_count: 0,
                    total_managed_value: 0,
                    commission: 0,
                    active_companies: []
                });
            }

            const stats = consultantStats.get(userId)!;
            stats.companies_count++;
            stats.total_managed_value += contractValue;
            // Add company to details
            stats.active_companies.push({
                id: record.company.id,
                name: record.company.name,
                value: contractValue
            });
        }

        // Calculate Commission (15%) and Format
        // Calculate Commission (15%) and Format
        const ranking = Array.from(consultantStats.values()).map(stat => ({
            ...stat,
            commission: stat.total_managed_value * 0.15
        })).sort((a, b) => b.total_managed_value - a.total_managed_value); // Sort by value

        return {
            active_companies_count: totalActiveCompanies,
            total_active_value: totalActiveValue,
            consultant_ranking: ranking
        };
    }

    async getProductionMetrics() {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Start of Week (Sunday)
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());

        // Start of Month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // 1. Overdue Tasks (Not done, deadline < now)
        const overdueTasks = await this.prisma.task.findMany({
            where: {
                status: { not: 'done' },
                deadline: { lt: now }
            },
            include: {
                list: { include: { folder: { include: { space: true } } } },
                assignees: { include: { user: true } }
            },
            orderBy: { deadline: 'asc' }
        });

        // 2. Upcoming Tasks (Not done, deadline between now and +3 days)
        const threeDaysFromNow = new Date(now);
        threeDaysFromNow.setDate(now.getDate() + 3);

        const upcomingTasks = await this.prisma.task.findMany({
            where: {
                status: { not: 'done' },
                deadline: { gte: now, lte: threeDaysFromNow }
            },
            include: {
                list: { include: { folder: { include: { space: true } } } },
                assignees: { include: { user: true } }
            },
            orderBy: { deadline: 'asc' }
        });

        // 3. Completed Tasks (Production) - Fetch last month's data to calculate D/W/M
        // Note: Using updated_at as proxy for completion time
        const completedTasks = await this.prisma.task.findMany({
            where: {
                status: 'done',
                updated_at: { gte: startOfMonth }
            },
            include: {
                assignees: { include: { user: true } }
            }
        });

        // Group by User
        const userStats = new Map<string, {
            id: string;
            name: string;
            avatar: string | null;
            daily: number;
            weekly: number;
            monthly: number;
        }>();

        for (const task of completedTasks) {
            const taskDate = new Date(task.updated_at);

            for (const assignee of task.assignees) {
                const userId = assignee.user_id;

                if (!userStats.has(userId)) {
                    userStats.set(userId, {
                        id: userId,
                        name: assignee.user.name,
                        avatar: assignee.user.avatar_url,
                        daily: 0,
                        weekly: 0,
                        monthly: 0
                    });
                }

                const stats = userStats.get(userId)!;
                stats.monthly++; // Since we filtered by startOfMonth

                if (taskDate >= startOfWeek) {
                    stats.weekly++;
                }

                if (taskDate >= startOfDay) {
                    stats.daily++;
                }
            }
        }

        return {
            overdue: overdueTasks,
            upcoming: upcomingTasks,
            production_by_user: Array.from(userStats.values()).sort((a, b) => b.monthly - a.monthly)
        };
    }
}
