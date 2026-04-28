import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SpotsService } from './spots.service';
import { CreateSpotDto } from './dto/create-spot.dto';
import { UpdateSpotDto } from './dto/update-spot.dto';
import { SearchSpotDto } from './dto/search-spot.dto';

@Controller()
export class SpotsController {
  constructor(private readonly spotsService: SpotsService) {}

  @Throttle({ short: { ttl: 1000, limit: 2 } })
  @Get('categories/:categoryId/spots')
  findByCategory(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Query() query: SearchSpotDto,
  ) {
    return this.spotsService.findByCategory(categoryId, query.q, query.page, query.limit);
  }

  @Post('categories/:categoryId/spots')
  create(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Body() dto: CreateSpotDto,
  ) {
    return this.spotsService.create(categoryId, dto);
  }

  @Patch('categories/:categoryId/spots/:id')
  update(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSpotDto,
  ) {
    return this.spotsService.update(categoryId, id, dto);
  }

  @Delete('categories/:categoryId/spots/:id')
  remove(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.spotsService.remove(categoryId, id);
  }
}
