import { describe, expect, it } from 'vitest'
import { collectionProducts } from '../../../src/domains/products/utils/collectionProducts.js'

const products = [
  { id: 'new', status: 'active' }, { id: 'second', status: 'out-of-stock' },
  { id: 'first', status: 'active' }, { id: 'upcoming', status: 'coming-soon' },
  { id: 'sample', status: 'coming-soon', isTestProduct: true },
  { id: 'draft', status: 'draft' }, { id: 'archived', status: 'archived' },
]
const ids = values => values.map(value => value.id)
describe('main catalog versus curated collections', () => {
  it('retains newly published items after selected presentation IDs load', () => {
    const before = collectionProducts(products)
    const after = collectionProducts(products, { productIds: ['first', 'second', 'sample'] })
    expect(ids(after)).toEqual(['first', 'second', 'sample', 'new'])
    expect(new Set(ids(after))).toEqual(new Set(ids(before)))
    expect(products[0].id).toBe('new')
  })
  it('does not override explicit alphabetical or price sorting', () => {
    expect(ids(collectionProducts(products, { productIds: ['first'], sort: 'price-low' }))).toEqual(['new', 'second', 'first', 'sample'])
  })
  it('preserves selected-only extra collections and already-applied search filters', () => {
    expect(ids(collectionProducts(products, { id: 'holiday', productIds: ['first'] }))).toEqual(['first'])
    expect(collectionProducts([], { productIds: ['first'] })).toEqual([])
    expect(ids(collectionProducts(products.filter(p => p.id === 'new'), { productIds: ['first'] }))).toEqual(['new'])
  })
  it('never includes draft/archived or ordinary coming-soon records', () => {
    expect(ids(collectionProducts(products, { id: 'holiday', productIds: [] }))).toEqual(['new', 'second', 'first', 'sample'])
  })
})
