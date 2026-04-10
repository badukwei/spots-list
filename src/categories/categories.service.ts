import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, ilike } from 'drizzle-orm';
import { DATABASE } from '../db/db.module';
import type { DrizzleDB } from '../db/db.module';
import { categories } from '../db/schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@Inject(DATABASE) private db: DrizzleDB) {}

  async findAll(q?: string) {
    if (q) {
      const escaped = q.replace(/[%_\\]/g, '\\$&');
      return this.db
        .select()
        .from(categories)
        .where(ilike(categories.name, `%${escaped}%`))
        .orderBy(categories.createdAt);
    }
    return this.db.select().from(categories).orderBy(categories.createdAt);
  }

  async findOne(id: string) {
    const [category] = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id));
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const [category] = await this.db.insert(categories).values(dto).returning();
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const [category] = await this.db
      .update(categories)
      .set(dto)
      .where(eq(categories.id, id))
      .returning();
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return category;
  }

  async remove(id: string) {
    const [category] = await this.db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return category;
  }
}
