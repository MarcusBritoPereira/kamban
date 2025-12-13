import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('v1/companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
    constructor(private readonly companiesService: CompaniesService) { }

    @Get()
    findAll() {
        return this.companiesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.companiesService.findOne(id);
    }

    @Post()
    create(@Body() createCompanyDto: any) {
        return this.companiesService.create(createCompanyDto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateCompanyDto: any) {
        return this.companiesService.update(id, updateCompanyDto);
    }

    @Post(':id/members')
    addMember(@Param('id') id: string, @Body() body: { userId: string, role: string }) {
        return this.companiesService.addMember(id, body.userId, body.role);
    }

    @Delete(':id/members/:userId')
    removeMember(@Param('id') id: string, @Param('userId') userId: string) {
        return this.companiesService.removeMember(id, userId);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.companiesService.remove(id);
    }
}
