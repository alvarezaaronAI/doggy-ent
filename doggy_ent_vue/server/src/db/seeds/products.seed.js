import pkg from '@prisma/client'

const { PrismaClient } = pkg
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Doggy Ent products...')

  await prisma.productVariant.deleteMany()
  await prisma.product.deleteMany()

  const products = [
    {
      name: 'Chicken Breast Jerky',
      slug: 'chicken-breast-jerky',
      description: 'Lean, hand-sliced chicken breast dehydrated low and slow.',
      protein: 'Chicken',
      cut: 'Breast',
      category: 'Jerky',
      image:
        'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?q=80&w=1200&auto=format&fit=crop',
      ingredients:
        'Chicken breast. No salt, no sugar, no glycerin, no preservatives.',
      texture:
        'Firm jerky texture that can be broken into smaller pieces.',
      bestFor:
        'Training rewards, bigger dogs, picky pups, and simple-ingredient routines.',
      freshness:
        'Best enjoyed within 14–21 days after opening. Keep sealed for freshness.',
      storageFeeding:
        'Keep sealed in a cool, dry place. Refrigerate after opening for max freshness. Treats are intended for intermittent or supplemental feeding only. Always supervise and provide fresh water.',
      featured: true,
      sellingMode: 'MADE_TO_ORDER',
      tags: ['Single-ingredient', 'Grain-free'],
      status: 'ACTIVE',
      variants: [
        {
          size: '6 oz',
          price: 1499,
          inventory: 24,
          sku: 'CNE-DT-CHICKEN-6OZ',
        },
        {
          size: '18 oz',
          price: 3999,
          inventory: 10,
          sku: 'CNE-DT-CHICKEN-18OZ',
        },
      ],
    },
    {
      name: 'Beef Jerky',
      slug: 'beef-jerky',
      description: 'Rich beef jerky made for bigger dogs who love a stronger flavor.',
      protein: 'Beef',
      cut: 'Lean Cut',
      category: 'Jerky',
      image:
        'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?q=80&w=1200&auto=format&fit=crop',
      ingredients:
        'Beef. No salt, no sugar, no glycerin, no preservatives.',
      texture:
        'Firm, rich jerky texture with a stronger chew.',
      bestFor:
        'Bigger dogs, rich-flavor lovers, high-value rewards, and dogs who enjoy beef treats.',
      freshness:
        'Best enjoyed within 14–21 days after opening. Keep sealed for freshness.',
      storageFeeding:
        'Keep sealed in a cool, dry place. Refrigerate after opening for max freshness. Treats are intended for intermittent or supplemental feeding only. Always supervise and provide fresh water.',
      featured: false,
      sellingMode: 'INVENTORY_LIMITED',
      tags: ['High Protein', 'Rich Flavor'],
      status: 'ACTIVE',
      variants: [
        {
          size: '6 oz',
          price: 1799,
          inventory: 18,
          sku: 'CNE-DT-BEEF-6OZ',
        },
        {
          size: '18 oz',
          price: 4799,
          inventory: 0,
          sku: 'CNE-DT-BEEF-18OZ',
        },
      ],
    },
    {
      name: 'Turkey Jerky',
      slug: 'turkey-jerky',
      description: 'A lighter protein option with a clean, simple ingredient list.',
      protein: 'Turkey',
      cut: 'Breast',
      category: 'Jerky',
      image:
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200&auto=format&fit=crop',
      ingredients:
        'Turkey breast. No salt, no sugar, no glycerin, no preservatives.',
      texture:
        'Lean jerky texture that breaks down into smaller training pieces.',
      bestFor:
        'Dogs who prefer lighter proteins, training rewards, and simple-ingredient treat routines.',
      freshness:
        'Best enjoyed within 14–21 days after opening. Keep sealed for freshness.',
      storageFeeding:
        'Keep sealed in a cool, dry place. Refrigerate after opening for max freshness. Treats are intended for intermittent or supplemental feeding only. Always supervise and provide fresh water.',
      featured: false,
      sellingMode: 'INVENTORY_LIMITED',
      tags: ['Lean Protein', 'Easy to Digest'],
      status: 'DRAFT',
      variants: [
        {
          size: '6 oz',
          price: 1699,
          inventory: 0,
          sku: 'CNE-DT-TURKEY-6OZ',
        },
        {
          size: '18 oz',
          price: 4499,
          inventory: 0,
          sku: 'CNE-DT-TURKEY-18OZ',
        },
      ],
    },
    {
      name: 'Lamb Jerky',
      slug: 'lamb-jerky',
      description: 'A premium lamb treat option for dogs who love richer proteins.',
      protein: 'Lamb',
      cut: 'Lean Cut',
      category: 'Jerky',
      image:
        'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1200&auto=format&fit=crop',
      ingredients:
        'Lamb. No salt, no sugar, no glycerin, no preservatives.',
      texture:
        'Premium firm jerky texture with a richer chew.',
      bestFor:
        'Premium treat routines, richer protein variety, bigger dogs, and high-value rewards.',
      freshness:
        'Best enjoyed within 14–21 days after opening. Keep sealed for freshness.',
      storageFeeding:
        'Keep sealed in a cool, dry place. Refrigerate after opening for max freshness. Treats are intended for intermittent or supplemental feeding only. Always supervise and provide fresh water.',
      featured: false,
      sellingMode: 'INVENTORY_LIMITED',
      tags: ['Premium Cut', 'Rich Protein'],
      status: 'DRAFT',
      variants: [
        {
          size: '6 oz',
          price: 2299,
          inventory: 0,
          sku: 'CNE-DT-LAMB-6OZ',
        },
        {
          size: '18 oz',
          price: 5999,
          inventory: 0,
          sku: 'CNE-DT-LAMB-18OZ',
        },
      ],
    },
    {
      name: 'Training Bites',
      slug: 'training-bites',
      description: 'Tiny, high-reward morsels for focused sessions.',
      protein: 'Chicken',
      cut: 'Small Bite',
      category: 'Training',
      image:
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200&auto=format&fit=crop',
      ingredients:
        'Chicken. No salt, no sugar, no glycerin, no preservatives.',
      texture:
        'Small bite-sized pieces designed for quick rewards.',
      bestFor:
        'Training sessions, puppy practice, small rewards, and repeated commands.',
      freshness:
        'Best enjoyed within 14–21 days after opening. Keep sealed for freshness.',
      storageFeeding:
        'Keep sealed in a cool, dry place. Refrigerate after opening for max freshness. Treats are intended for intermittent or supplemental feeding only. Always supervise and provide fresh water.',
      featured: false,
      sellingMode: 'PREORDER',
      tags: ['Training Size', 'Coming Soon'],
      status: 'COMING_SOON',
      variants: [
        {
          size: '6 oz',
          price: 1399,
          inventory: 0,
          sku: 'CNE-DT-TRAINING-6OZ',
        },
        {
          size: '18 oz',
          price: 3699,
          inventory: 0,
          sku: 'CNE-DT-TRAINING-18OZ',
        },
      ],
    },
    {
      name: 'Seasonal Drop',
      slug: 'seasonal-drop',
      description: 'Limited runs inspired by the season. New flavors, same clean promise.',
      protein: 'Rotating',
      cut: 'Limited Batch',
      category: 'Seasonal',
      image:
        'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?q=80&w=1200&auto=format&fit=crop',
      ingredients:
        'Rotating seasonal protein. Final ingredients listed on each batch.',
      texture:
        'Limited-batch texture varies by seasonal recipe.',
      bestFor:
        'Seasonal variety, limited drops, giftable treat moments, and dogs who enjoy new flavors.',
      freshness:
        'Freshness guidance will be listed on each seasonal batch.',
      storageFeeding:
        'Follow the storage guidance listed on each seasonal batch. Treats are intended for intermittent or supplemental feeding only. Always supervise and provide fresh water.',
      featured: false,
      sellingMode: 'PREORDER',
      tags: ['Limited Time', 'Special Flavor'],
      status: 'COMING_SOON',
      variants: [
        {
          size: '6 oz',
          price: 1899,
          inventory: 0,
          sku: 'CNE-DT-SEASONAL-6OZ',
        },
        {
          size: '18 oz',
          price: 4999,
          inventory: 0,
          sku: 'CNE-DT-SEASONAL-18OZ',
        },
      ],
    },
  ]

  for (const product of products) {
    await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        protein: product.protein,
        cut: product.cut,
        category: product.category,
        image: product.image,
        ingredients: product.ingredients,
        texture: product.texture,
        bestFor: product.bestFor,
        freshness: product.freshness,
        storageFeeding: product.storageFeeding,
        featured: product.featured,
        sellingMode: product.sellingMode,
        tags: product.tags,
        status: product.status,
        variants: {
          create: product.variants,
        },
      },
    })
  }

  console.log('✅ Product seed completed.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
