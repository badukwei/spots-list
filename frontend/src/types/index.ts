export interface Category {
  id: string
  name: string
  emoji: string | null
  createdAt: string
  deletedAt: string | null
}

export interface Spot {
  id: string
  categoryId: string
  name: string
  address: string | null
  mapsUrl: string | null
  notes: string | null
  createdAt: string
  deletedAt: string | null
}
