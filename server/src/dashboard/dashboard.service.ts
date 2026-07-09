
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    private getDateFilter(period: string = '30d') {
        const now = new Date();
        const past = new Date();

        switch (period) {
            case '7d': past.setDate(now.getDate() - 7); break;
            case '90d': past.setDate(now.getDate() - 90); break;
            case '30d': default: past.setDate(now.getDate() - 30); break;
        }
        return { gte: past };
    }

    async getExecutiveKPIs(filters: { period?: string, spaceId?: string }) {
        const dateFilter = this.getDateFilter(filters.period);

        // 1. MRR (Active Contracts)
        const activeCompanies = await this.prisma.company.findMany({
            where: { status: 'active' },
            select: { contract_value: true }
        });
        const mrr = activeCompanies.reduce((sum, c) => sum + (Number(c.contract_value) || 0), 0);

        // 2. Capacity (Total vs Used)
        // Assumption: 160h/month per active editor/gestor
        const staffCount = await this.prisma.user.count({
            where: { role: { in: ['admin', 'gestor', 'editor'] } }
        });
        const totalCapacity = staffCount * 160;

        const tasksInPeriod = await this.prisma.task.findMany({
            where: {
                created_at: dateFilter,
                status: { not: 'done' }
            },
            select: { estimated_hours: true }
        });
        const usedCapacity = tasksInPeriod.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);

        // 3. Rework Rate (Tasks with 'rejected' status in history / Total finished)
        // Approximation: Current status 'rejected' or 'in_review'? 
        // Better: Count activities of type "status_change" to "rejected"
        // For MVP: Count current 'rejected' tasks vs total active
        const rejectedTasks = await this.prisma.task.count({ where: { status: 'rejected', updated_at: dateFilter } });
        const completedTasks = await this.prisma.task.count({ where: { status: 'done', updated_at: dateFilter } });
        const reworkRate = completedTasks > 0 ? (rejectedTasks / completedTasks) * 100 : 0;

        return {
            mrr,
            active_clients: activeCompanies.length,
            capacity: {
                total: totalCapacity,
                used: usedCapacity,
                percentage: totalCapacity > 0 ? Math.round((usedCapacity / totalCapacity) * 100) : 0
            },
            rework_rate: Math.round(reworkRate),
            overdue_count: await this.prisma.task.count({
                where: {
                    status: { not: 'done' },
                    deadline: { lt: new Date() }
                }
            })
        };
    }

    async getTeamHealth(filters: { period?: string }) {
        const dateFilter = this.getDateFilter(filters.period);

        // Get all users with tasks
        const users = await this.prisma.user.findMany({
            where: { role: { not: 'leitor' } },
            include: {
                task_assignees: {
                    where: { task: { status: { not: 'done' } } },
                    include: { task: true }
                },
                activities: {
                    where: { created_at: dateFilter, type: 'status_change', content: { contains: 'concluído' } } // Approximation for production
                }
            }
        });

        return users.map(u => {
            const activeTasks = u.task_assignees.map(ta => ta.task);
            const overdue = activeTasks.filter(t => t.deadline && new Date(t.deadline) < new Date()).length;
            const load = activeTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);

            return {
                id: u.id,
                name: u.name,
                avatar: u.avatar_url,
                role: u.role,
                active_tasks: activeTasks.length,
                overdue,
                load_hours: load,
                // Simple bottleneck check: Load > 120h or Overdue > 3
                status: (overdue > 3 || load > 120) ? 'critical' : (overdue > 0 || load > 100) ? 'warning' : 'healthy'
            };
        }).sort((a, b) => b.load_hours - a.load_hours);
    }

    async getClientPerformance(filters: { period?: string }) {
        // 1. Fetch all active companies
        const companies = await this.prisma.company.findMany({
            where: { status: 'active' },
            select: { id: true, name: true }
        });

        // 2. Fetch all tasks within period that have tags matching company names
        // We fetch nested: Tags -> Tasks
        // Optimization: Fetch all tasks with their tags, then filter in memory (efficient for thousands, not millions)
        // Or: For each company, fetch tasks (N queries).
        // Best: Fetch tasks with tags, group by matching tag.

        const dateFilter = this.getDateFilter(filters.period);
        const tasks = await this.prisma.task.findMany({
            where: { created_at: dateFilter },
            include: { tags: { include: { tag: true } } }
        });

        const stats = companies.map(company => {
            // Find tasks that have a tag with the exact name of the company (case insensitive)
            const companyTasks = tasks.filter(t =>
                t.tags.some(tt => tt.tag.name.toLowerCase() === company.name.toLowerCase())
            );

            const total = companyTasks.length;
            const overdue = companyTasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done').length;
            const done = companyTasks.filter(t => t.status === 'done').length;

            // Health
            const health = overdue > 5 ? 'critical' : overdue > 0 ? 'warning' : 'healthy';

            return {
                id: company.id,
                name: company.name,
                total_demands: total,
                delivered: done,
                overdue,
                health
            };
        });

        return stats.sort((a, b) => b.total_demands - a.total_demands);
    }

    // LEGACY METHODS (Kept to fix build until Frontend is fully migrated)
    async getMetrics() {
        const kpis = await this.getExecutiveKPIs({});
        // Map to old format approx
        const activeCompanies = await this.prisma.company.findMany({ where: { status: 'active' } }); // Re-fetch or simplify
        return {
            active_companies_count: kpis.active_clients,
            total_active_value: kpis.mrr,
            consultant_ranking: [] // Deprecated or need simple fetch
        };
    }

    async getProductionMetrics() {
        // Simple shim or empty return to satisfy TS if we don't care about old dashboard anymore
        return {
            overdue: [],
            upcoming: [],
            production_by_user: []
        };
    }
}
