import { Injectable, Inject, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { DATABASE } from '../db/db.module'
import type { DrizzleDB } from '../db/db.module'
import { spots } from '../db/schema'
import { CreateSpotDto } from './dto/create-spot.dto'
import { UpdateSpotDto } from './dto/update-spot.dto'

@Injectable()
export class SpotsService {
  constructor(@Inject(DATABASE) private db: DrizzleDB) {}

  async findByCategory(categoryId: string) {
    return this.db
      .select()
      .from(spots)
      .where(eq(spots.categoryId, categoryId))
      .orderBy(spots.createdAt)
  }

  async create(categoryId: string, dto: CreateSpotDto) {
    const [spot] = await this.db
      .insert(spots)
      .values({ ...dto, categoryId })
      .returning()
    return spot
  }

  async update(id: string, dto: UpdateSpotDto) {
    const [spot] = await this.db
      .update(spots)
      .set(dto)
      .where(eq(spots.id, id))
      .returning()
    if (!spot) throw new NotFoundException(`Spot ${id} not found`)
    return spot
  }

  async remove(id: string) {
    const [spot] = await this.db
      .delete(spots)
      .where(eq(spots.id, id))
      .returning()
    if (!spot) throw new NotFoundException(`Spot ${id} not found`)
    return spot
  }
}
