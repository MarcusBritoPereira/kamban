import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SearchService } from './search.service';

@UseGuards(JwtAuthGuard)
@Controller('v1/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  globalSearch(@Query('q') q: string, @Query('limit') limit: string, @Request() req: any) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.searchService.globalSearch(req.user, q, parsedLimit);
  }
}
