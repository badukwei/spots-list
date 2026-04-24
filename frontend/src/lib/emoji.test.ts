// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { getAutoEmoji, getCategoryColor, getSpotGradient } from './emoji'

describe('getAutoEmoji', () => {
  it('returns emoji string for index 0', () => {
    expect(typeof getAutoEmoji(0)).toBe('string')
    expect(getAutoEmoji(0).length).toBeGreaterThan(0)
  })
  it('wraps around after palette length', () => {
    expect(getAutoEmoji(0)).toBe(getAutoEmoji(63))
  })
})

describe('getCategoryColor', () => {
  it('returns bg and text strings', () => {
    const c = getCategoryColor(0)
    expect(c).toHaveProperty('bg')
    expect(c).toHaveProperty('text')
  })
  it('wraps around after palette length', () => {
    const a = getCategoryColor(0)
    const b = getCategoryColor(6)
    expect(a).toEqual(b)
  })
})

describe('getSpotGradient', () => {
  it('returns a CSS gradient string', () => {
    expect(getSpotGradient(0)).toMatch(/gradient/)
  })
  it('wraps around after palette length', () => {
    expect(getSpotGradient(0)).toBe(getSpotGradient(6))
  })
})
