import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SpotsService } from './spots.service';
import { CreateSpotDto } from './dto/create-spot.dto';
import { UpdateSpotDto } from './dto/update-spot.dto';

@Controller()
export class SpotsController {
  constructor(private readonly spotsService: SpotsService) {}

  @Get('categories/:categoryId/spots')
  findByCategory(@Param('categoryId', ParseUUIDPipe) categoryId: string) {
    return this.spotsService.findByCategory(categoryId);
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
