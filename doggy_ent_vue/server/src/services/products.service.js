const mockProducts = [
  {
    id: 'chicken-breast-jerky',
    name: 'Chicken Breast Jerky',
    shortDescription: 'Lean, hand-sliced chicken breast dehydrated low and slow.',
    price: 12.99,
    category: 'Jerky',
    status: 'active',
    featured: true,
    image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'taste-test-trio',
    name: 'Taste Test Trio',
    shortDescription: 'Three small bags for picky pups and first-time buyers.',
    price: 29.99,
    category: 'Bundle',
    status: 'draft',
    featured: false,
    image: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'big-lab-bundle',
    name: 'Big Lab Bundle',
    shortDescription: 'A larger bundle for multi-dog homes and bigger snackers.',
    price: 59.99,
    category: 'Bundle',
    status: 'active',
    featured: false,
    image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1200&auto=format&fit=crop',
  },
]

export async function fetchAllProducts() {
  return mockProducts
}
