// @vitest-environment node
import { describe, it, expectTypeOf } from 'vitest'
import type { Category, Spot } from './index'

describe('Category type', () => {
  it('has required fields', () => {
    expectTypeOf<Category>().toHaveProperty('id')
    expectTypeOf<Category>().toHaveProperty('name')
    expectTypeOf<Category>().toHaveProperty('createdAt')
  })
})

describe('Spot type', () => {
  it('has required and optional fields', () => {
    expectTypeOf<Spot>().toHaveProperty('id')
    expectTypeOf<Spot>().toHaveProperty('name')
    expectTypeOf<Spot>().toHaveProperty('categoryId')
    expectTypeOf<Spot['address']>().toEqualTypeOf<string | null>()
    expectTypeOf<Spot['mapsUrl']>().toEqualTypeOf<string | null>()
    expectTypeOf<Spot['notes']>().toEqualTypeOf<string | null>()
  })
})
