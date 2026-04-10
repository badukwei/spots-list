import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common'
import { SpotsService } from './spots.service'
import { CreateSpotDto } from './dto/create-spot.dto'
import { UpdateSpotDto } from './dto/update-spot.dto'

@Controller()
export class SpotsController {
  constructor(private readonly spotsService: SpotsService) {}

  @Get('categories/:categoryId/spots')
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.spotsService.findByCategory(categoryId)
  }

  @Post('categories/:categoryId/spots')
  create(
    @Param('categoryId') categoryId: string,
    @Body() dto: CreateSpotDto,
  ) {
    return this.spotsService.create(categoryId, dto)
  }

  @Patch('spots/:id')
  update(@Param('id') id: string, @Body() dto: UpdateSpotDto) {
    return this.spotsService.update(id, dto)
  }

  @Delete('spots/:id')
  remove(@Param('id') id: string) {
    return this.spotsService.remove(id)
  }
}
