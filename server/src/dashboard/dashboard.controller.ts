
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('v1/dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('metrics')
    async getMetrics() {
        return this.dashboardService.getMetrics();
    }

    @Get('production')
    async getProductionMetrics() {
        return this.dashboardService.getProductionMetrics();
    }

    @Get('kpis')
    async getExecutiveKPIs(@Query('period') period?: string, @Query('spaceId') spaceId?: string) {
        return this.dashboardService.getExecutiveKPIs({ period, spaceId });
    }

    @Get('team')
    async getTeamHealth(@Query('period') period?: string) {
        return this.dashboardService.getTeamHealth({ period });
    }

    @Get('workload')
    async getWorkload(@Query('period') period?: string) {
        return this.dashboardService.getWorkload({ period });
    }

    @Get('clients')
    async getClientPerformance(@Query('period') period?: string) {
        return this.dashboardService.getClientPerformance({ period });
    }
}
