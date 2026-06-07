import { describe, expect, it } from 'vitest'

import {
  normalizeCurrencyAmount,
} from '../../../src/shared/utils/money.js'
import {
  normalizeEmail,
  normalizeNullableNumber,
  slugify,
} from '../../../src/shared/utils/string.js'

describe('shared utility helpers', () => {
  it('normalizes currency to two decimal places', () => {
    expect(normalizeCurrencyAmount(10.239)).toBe(10.24)
    expect(normalizeCurrencyAmount('bad')).toBe(0)
  })

  it('normalizes email and nullable numbers', () => {
    expect(normalizeEmail(' Test@Example.COM ')).toBe('test@example.com')
    expect(normalizeNullableNumber('')).toBeNull()
    expect(normalizeNullableNumber('12.5')).toBe(12.5)
  })

  it('slugifies display names', () => {
    expect(slugify('Laika Shelter Drive!')).toBe('laika-shelter-drive')
  })
})
