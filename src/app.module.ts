import { Module } from '@nestjs/common'
import { DbModule } from './db/db.module'
import { CategoriesModule } from './categories/categories.module'

@Module({
  imports: [DbModule, CategoriesModule],
})
export class AppModule {}
