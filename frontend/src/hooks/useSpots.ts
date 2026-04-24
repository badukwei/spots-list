import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Spot } from '@/types'
import type { SpotFormValues } from '@/schemas/spot'

export function useSpots(categoryId: string | undefined) {
  return useQuery({
    queryKey: ['spots', categoryId],
    queryFn: async () => {
      const { data } = await api.get<Spot[]>(`/categories/${categoryId}/spots`)
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
