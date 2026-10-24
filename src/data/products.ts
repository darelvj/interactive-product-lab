export type Product = { number: string; slug: string; name: string; category: string; description: string; mood: string }
export const products: Product[] = [
  { number: '001', slug: 'aura', name: 'AURA', category: 'Water Bottle', description: 'Fluidity. Simplicity. Precision.', mood: 'dark' },
  { number: '002', slug: 'chronos', name: 'CHRONOS', category: 'Mechanical Watch', description: 'A closer look at time.', mood: 'silver' },
  { number: '003', slug: 'loop', name: 'LOOP', category: 'Kinetic Machine', description: 'Curiosity in motion.', mood: 'color' },
]
