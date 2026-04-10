import { Module } from '@nestjs/common';
import { DbModule } from './db/db.module';
import { CategoriesModule } from './categories/categories.module';
import { SpotsModule } from './spots/spots.module';

@Module({
  imports: [DbModule, CategoriesModule, SpotsModule],
})
export class AppModule {}
