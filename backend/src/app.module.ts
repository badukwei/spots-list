import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { DbModule } from './db/db.module';
import { CategoriesModule } from './categories/categories.module';
import { SpotsModule } from './spots/spots.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'long', ttl: 60_000, limit: 20 },
      { name: 'short', ttl: 3_000, limit: 1 },
    ]),
    DbModule,
    CategoriesModule,
    SpotsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
