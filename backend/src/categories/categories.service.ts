import {
  BadRequestException,
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, ilike, isNull, sql } from 'drizzle-orm';
import { DATABASE } from '../db/db.module';
import type { DrizzleDB } from '../db/db.module';
import { categories, spots } from '../db/schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@Inject(DATABASE) private db: DrizzleDB) {}

  async findAll(q?: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const baseWhere = q
      ? and(ilike(categories.name, `%${q.replace(/[%_\\]/g, '\\$&')}%`), isNull(categories.deletedAt))
      : isNull(categories.deletedAt);

    const [{ total }] = await this.db
      .select({ total: sql<number>`cast(count(*) as int)` })
      .from(categories)
      .where(baseWhere);

    const data = await this.db
      .select()
      .from(categories)
      .where(baseWhere)
      .orderBy(categories.createdAt)
      .limit(limit)
      .offset(offset);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const [category] = await this.db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), isNull(categories.deletedAt)));
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const [category] = await this.db.insert(categories).values(dto).returning();
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('Request body must not be empty');
    }
    const [category] = await this.db
      .update(categories)
      .set(dto)
      .where(and(eq(categories.id, id), isNull(categories.deletedAt)))
      .returning();
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return category;
  }

  async remove(id: string) {
    const now = new Date();
    // Soft-delete all spots in this category first
    await this.db
      .update(spots)
      .set({ deletedAt: now })
      .where(and(eq(spots.categoryId, id), isNull(spots.deletedAt)));
    // Soft-delete the category
    const [category] = await this.db
      .update(categories)
      .set({ deletedAt: now })
      .where(and(eq(categories.id, id), isNull(categories.deletedAt)))
      .returning();
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return category;
  }
}
