export const PRODUCT_VARIANT_SIZES = {
  SIX_OZ: '6 oz',
  EIGHTEEN_OZ: '18 oz',
}

export const PRODUCT_LOW_STOCK_THRESHOLDS = {
  [PRODUCT_VARIANT_SIZES.SIX_OZ]: 5,
  [PRODUCT_VARIANT_SIZES.EIGHTEEN_OZ]: 3,
}

export const PRODUCT_DEFAULTS = {
  SELLING_MODE: 'inventory-limited',
  INGREDIENTS:
    'Protein. No salt, no sugar, no glycerin, no preservatives.',
  TEXTURE:
    'Firm jerky texture that can be broken into smaller pieces.',
  BEST_FOR:
    'Training rewards, bigger dogs, picky pups, and simple-ingredient routines.',
  FRESHNESS:
    'Best enjoyed within 14–21 days after opening. Keep sealed for freshness.',
  STORAGE_FEEDING:
    'Keep sealed in a cool, dry place. Refrigerate after opening for max freshness. Treats are intended for intermittent or supplemental feeding only. Always supervise and provide fresh water.',
}

export const PRODUCT_STOCK_STATUS = {
  COMING_SOON: 'coming-soon',
  OUT_OF_STOCK: 'out-of-stock',
  IN_STOCK: 'in-stock',
}
