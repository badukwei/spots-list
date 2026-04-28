import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Category, PaginatedResponse } from '@/types'

export function useCategories(search?: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['categories', search ?? '', page, limit],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit }
      if (search) params.q = search
      const { data } = await api.get<PaginatedResponse<Category>>('/categories', { params })
      return data
    },
  })
}

export function useCategory(id: string | undefined) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      const { data } = await api.get<Category>(`/categories/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useAddCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, emoji }: { name: string; emoji?: string }) => {
      const { data } = await api.post<Category>('/categories', { name, emoji })
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name, emoji }: { id: string; name?: string; emoji?: string }) => {
      const { data } = await api.patch<Category>(`/categories/${id}`, { name, emoji })
      return data
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] })
      void queryClient.invalidateQueries({ queryKey: ['category', data.id] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<Category>(`/categories/${id}`)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}
