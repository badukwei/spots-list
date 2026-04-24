// frontend/src/components/AddSpotModal.tsx
import { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { spotSchema, type SpotFormValues } from '@/schemas/spot'
import { useAddSpot, useSpots } from '@/hooks/useSpots'
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
  const { data: existingSpots } = useSpots(categoryId)
  const [nameValue, setNameValue] = useState('')
  const [mapsUrlValue, setMapsUrlValue] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SpotFormValues>({
    resolver: zodResolver(spotSchema),
  })

  const fuse = useMemo(() => {
    if (!existingSpots) return null
    return new Fuse(existingSpots, {
      keys: ['name'],
      threshold: 0.4,
    })
  }, [existingSpots])

  const similarByName = useMemo(() => {
    if (!fuse || !nameValue.trim()) return []
    return fuse.search(nameValue.trim()).map((r) => r.item)
  }, [fuse, nameValue])

  const duplicateByUrl = useMemo(() => {
    if (!mapsUrlValue.trim() || !existingSpots) return null
    return existingSpots.find(
      (s) => s.mapsUrl && s.mapsUrl.trim() === mapsUrlValue.trim()
    ) ?? null
  }, [mapsUrlValue, existingSpots])

  const onSubmit = async (values: SpotFormValues) => {
    await addSpot.mutateAsync(values)
    reset()
    setNameValue('')
    setMapsUrlValue('')
    onClose()
  }

  const handleClose = () => {
    reset()
    addSpot.reset()
    setNameValue('')
    setMapsUrlValue('')
    onClose()
  }

  const handleOpenChange = (o: boolean) => {
    if (!o) handleClose()
  }

  const nameRegister = register('name', {
    onChange: (e) => setNameValue(e.target.value),
  })
  const mapsUrlRegister = register('mapsUrl', {
    onChange: (e) => setMapsUrlValue(e.target.value),
  })

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">新增地點</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Input placeholder="名稱*" {...nameRegister} disabled={isSubmitting} />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
            {similarByName.length > 0 && (
              <div className="mt-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="text-xs font-medium text-amber-700">⚠️ 此分類已有類似地點：</p>
                <ul className="mt-0.5 space-y-0.5">
                  {similarByName.slice(0, 3).map((spot) => (
                    <li key={spot.id} className="text-xs text-amber-600">
                      「{spot.name}」
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div>
            <Input placeholder="地址（選填）" {...register('address')} disabled={isSubmitting} />
            {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address.message}</p>}
          </div>
          <div>
            <Input placeholder="Google Maps 連結（選填，需包含 https://）" {...mapsUrlRegister} disabled={isSubmitting} />
            {errors.mapsUrl && <p className="mt-1 text-xs text-destructive">{errors.mapsUrl.message}</p>}
            {duplicateByUrl && (
              <div className="mt-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="text-xs font-medium text-amber-700">⚠️ 此連結已存在：「{duplicateByUrl.name}」</p>
              </div>
            )}
          </div>
          <div>
            <Input placeholder="備註（選填）" {...register('notes')} disabled={isSubmitting} />
            {errors.notes && <p className="mt-1 text-xs text-destructive">{errors.notes.message}</p>}
          </div>
          {addSpot.error && <p className="text-xs text-destructive">新增失敗，請再試一次</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
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
