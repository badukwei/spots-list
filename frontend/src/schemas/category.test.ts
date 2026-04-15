// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { categorySchema } from './category'

describe('categorySchema', () => {
  it('accepts valid name', () => {
    expect(categorySchema.safeParse({ name: '適合一個人哭的地方' }).success).toBe(true)
  })

  it('rejects empty name', () => {
    expect(categorySchema.safeParse({ name: '' }).success).toBe(false)
  })

  it('rejects name over 100 chars', () => {
    expect(categorySchema.safeParse({ name: 'a'.repeat(101) }).success).toBe(false)
  })
})
