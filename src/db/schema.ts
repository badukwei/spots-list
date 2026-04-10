import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const spots = pgTable('spots', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  address: text('address'),
  mapsUrl: text('maps_url'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
})
