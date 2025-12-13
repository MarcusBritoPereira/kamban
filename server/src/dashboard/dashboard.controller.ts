
import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
// Assuming AuthGuard is available, or we keep it public for dev speed if requested, but let's try to be secure if possible.
// Given previous files didn't import AuthGuard explicitly in snippets, I'll stick to basic standard structure.

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
}
