import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Spot, PaginatedResponse } from '@/types'
import type { SpotFormValues } from '@/schemas/spot'

export function useSpots(categoryId: string | undefined, search?: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['spots', categoryId, search ?? '', page, limit],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit }
      if (search) params.q = search
      const { data } = await api.get<PaginatedResponse<Spot>>(
        `/categories/${categoryId}/spots`,
        { params }
      )
      return data
    },
    enabled: !!categoryId,
  })
}

export function useAddSpot(categoryId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: SpotFormValues) => {
      const body = {
        name: values.name,
        ...(values.address ? { address: values.address } : {}),
        ...(values.mapsUrl ? { mapsUrl: values.mapsUrl } : {}),
        ...(values.notes ? { notes: values.notes } : {}),
      }
      const { data } = await api.post<Spot>(`/categories/${categoryId}/spots`, body)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['spots', categoryId] })
    },
  })
}

export function useDeleteSpot(categoryId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<Spot>(`/categories/${categoryId}/spots/${id}`)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['spots', categoryId] })
    },
  })
}
