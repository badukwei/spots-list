// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { spotSchema } from './spot'

describe('spotSchema', () => {
  it('accepts minimal valid spot', () => {
    expect(spotSchema.safeParse({ name: '台大圖書館廁所' }).success).toBe(true)
  })

  it('rejects empty name', () => {
    expect(spotSchema.safeParse({ name: '' }).success).toBe(false)
  })

  it('accepts valid mapsUrl with http', () => {
    expect(spotSchema.safeParse({ name: 'test', mapsUrl: 'https://maps.google.com/abc' }).success).toBe(true)
  })

  it('rejects mapsUrl without protocol', () => {
    expect(spotSchema.safeParse({ name: 'test', mapsUrl: 'maps.google.com/abc' }).success).toBe(false)
  })

  it('rejects notes over 500 chars', () => {
    expect(spotSchema.safeParse({ name: 'test', notes: 'a'.repeat(501) }).success).toBe(false)
  })

  it('accepts empty optional fields', () => {
    expect(spotSchema.safeParse({ name: 'test', address: '', notes: '', mapsUrl: '' }).success).toBe(true)
  })
})
