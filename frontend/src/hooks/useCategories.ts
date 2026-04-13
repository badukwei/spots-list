import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Category } from '@/types'

export function useCategories(search?: string) {
  return useQuery({
    queryKey: ['categories', search ?? ''],
    queryFn: async () => {
      const params = search ? { q: search } : {}
      const { data } = await api.get<Category[]>('/categories', { params })
      return data
    },
  })
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: async () => {
      const { data } = await api.get<Category>(`/categories/${id}`)
      return data
    },
  })
}

export function useAddCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post<Category>('/categories', { name })
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}
