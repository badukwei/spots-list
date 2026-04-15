import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { spotSchema, type SpotFormValues } from '@/schemas/spot'
import { useAddSpot } from '@/hooks/useSpots'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  open: boolean
  onClose: () => void
  categoryId: string
}

export function AddSpotModal({ open, onClose, categoryId }: Props) {
  const addSpot = useAddSpot(categoryId)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SpotFormValues>({
    resolver: zodResolver(spotSchema),
  })

  const onSubmit = async (values: SpotFormValues) => {
    await addSpot.mutateAsync(values)
    reset()
    onClose()
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) { reset(); onClose() }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display italic text-lg">新增景點</DialogTitle>
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
            <Input placeholder="Google Maps 連結（選填，需包含 https://）" {...register('mapsUrl')} disabled={isSubmitting} />
            {errors.mapsUrl && <p className="mt-1 text-xs text-destructive">{errors.mapsUrl.message}</p>}
          </div>
          <div>
            <Input placeholder="備註（選填）" {...register('notes')} disabled={isSubmitting} />
            {errors.notes && <p className="mt-1 text-xs text-destructive">{errors.notes.message}</p>}
          </div>
          {addSpot.error && <p className="text-xs text-destructive">新增失敗，請再試一次</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => { reset(); onClose() }} disabled={isSubmitting}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '新增中...' : '新增'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
