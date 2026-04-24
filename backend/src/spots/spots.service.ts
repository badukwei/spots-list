import {
  BadRequestException,
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { DATABASE } from '../db/db.module';
import type { DrizzleDB } from '../db/db.module';
import { spots } from '../db/schema';
import { CreateSpotDto } from './dto/create-spot.dto';
import { UpdateSpotDto } from './dto/update-spot.dto';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class SpotsService {
  constructor(
    @Inject(DATABASE) private db: DrizzleDB,
    private categoriesService: CategoriesService,
  ) {}

  async findByCategory(categoryId: string, page = 1, limit = 20) {
    await this.categoriesService.findOne(categoryId);
    const offset = (page - 1) * limit;
    const where = and(eq(spots.categoryId, categoryId), isNull(spots.deletedAt));

    const [{ total }] = await this.db
      .select({ total: sql<number>`cast(count(*) as int)` })
      .from(spots)
      .where(where);

    const data = await this.db
      .select()
      .from(spots)
      .where(where)
      .orderBy(spots.createdAt)
      .limit(limit)
      .offset(offset);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(categoryId: string, dto: CreateSpotDto) {
    await this.categoriesService.findOne(categoryId);
    const [spot] = await this.db
      .insert(spots)
      .values({ ...dto, categoryId })
      .returning();
    return spot;
  }

  async update(categoryId: string, id: string, dto: UpdateSpotDto) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('Request body must not be empty');
    }
    await this.categoriesService.findOne(categoryId);
    const [spot] = await this.db
      .update(spots)
      .set(dto)
      .where(and(eq(spots.id, id), eq(spots.categoryId, categoryId), isNull(spots.deletedAt)))
      .returning();
    if (!spot) throw new NotFoundException(`Spot ${id} not found`);
    return spot;
  }

  async remove(categoryId: string, id: string) {
    await this.categoriesService.findOne(categoryId);
    const [spot] = await this.db
      .update(spots)
      .set({ deletedAt: new Date() })
      .where(and(eq(spots.id, id), eq(spots.categoryId, categoryId), isNull(spots.deletedAt)))
      .returning();
    if (!spot) throw new NotFoundException(`Spot ${id} not found`);
    return spot;
  }
}
