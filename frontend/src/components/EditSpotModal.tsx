// frontend/src/components/EditSpotModal.tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { spotSchema, type SpotFormValues } from '@/schemas/spot'
import { useUpdateSpot } from '@/hooks/useSpots'
import type { Spot } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  spot: Spot | null
  categoryId: string
  onClose: () => void
}

export function EditSpotModal({ spot, categoryId, onClose }: Props) {
  const open = spot !== null
  const updateSpot = useUpdateSpot(categoryId)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SpotFormValues>({
    resolver: zodResolver(spotSchema),
  })

  useEffect(() => {
    if (spot) {
      reset({
        name: spot.name,
        address: spot.address ?? '',
        mapsUrl: spot.mapsUrl ?? '',
        notes: spot.notes ?? '',
      })
    }
  }, [spot, reset])

  const onSubmit = async (values: SpotFormValues) => {
    if (!spot) return
    await updateSpot.mutateAsync({ id: spot.id, ...values })
    onClose()
  }

  const handleClose = () => {
    reset()
    updateSpot.reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">編輯地點</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Input placeholder="名稱*" {...register('name')} disabled={isSubmitting} />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div>
            <Input placeholder="地址（選填）" {...register('address')} disabled={isSubmitting} />
            {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address.message}</p>}
          </div>
          <div>
            <Input placeholder="Google Maps 連結*（需包含 https://）" {...register('mapsUrl')} disabled={isSubmitting} />
            {errors.mapsUrl && <p className="mt-1 text-xs text-destructive">{errors.mapsUrl.message}</p>}
          </div>
          <div>
            <Input placeholder="備註（選填）" {...register('notes')} disabled={isSubmitting} />
            {errors.notes && <p className="mt-1 text-xs text-destructive">{errors.notes.message}</p>}
          </div>
          {updateSpot.error && <p className="text-xs text-destructive">儲存失敗，請再試一次</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '儲存中...' : '儲存'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
