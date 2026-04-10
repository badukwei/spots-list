import { Module } from '@nestjs/common'
import { SpotsController } from './spots.controller'
import { SpotsService } from './spots.service'
import { CategoriesModule } from '../categories/categories.module'

@Module({
  imports: [CategoriesModule],
  controllers: [SpotsController],
  providers: [SpotsService],
})
export class SpotsModule {}
