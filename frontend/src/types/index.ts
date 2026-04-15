export interface Category {
  id: string
  name: string
  createdAt: string
}

export interface Spot {
  id: string
  categoryId: string
  name: string
  address: string | null
  mapsUrl: string | null
  notes: string | null
  createdAt: string
}
