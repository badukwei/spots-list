// frontend/src/components/EditCategoryModal.tsx
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { categorySchema, type CategoryFormValues } from '@/schemas/category'
import { useUpdateCategory } from '@/hooks/useCategories'
import { ALL_EMOJIS } from '@/lib/emoji'
import type { Category } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  category: Category | null
  onClose: () => void
}

export function EditCategoryModal({ category, onClose }: Props) {
  const open = category !== null
  const updateCategory = useUpdateCategory()
  const [selectedEmoji, setSelectedEmoji] = useState<string | undefined>(undefined)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  })

  useEffect(() => {
    if (category) {
      reset({ name: category.name, emoji: category.emoji ?? undefined })
      setSelectedEmoji(category.emoji ?? undefined)
    }
  }, [category, reset])

  const onSubmit = async (values: CategoryFormValues) => {
    if (!category) return
    await updateCategory.mutateAsync({
      id: category.id,
      name: values.name,
      emoji: selectedEmoji,
    })
    onClose()
  }

  const handleClose = () => {
    reset()
    updateCategory.reset()
    setSelectedEmoji(undefined)
    onClose()
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">編輯分類</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Emoji picker */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">選擇 Emoji</p>
            <div className="grid grid-cols-10 gap-1 rounded-xl border border-border bg-muted/30 p-2 max-h-40 overflow-y-auto">
              {ALL_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji === selectedEmoji ? undefined : emoji)}
                  className={[
                    'flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-colors',
                    selectedEmoji === emoji
                      ? 'bg-primary/15 ring-1 ring-primary'
                      : 'hover:bg-muted',
                  ].join(' ')}
                >
                  {emoji}
                </button>
              ))}
            </div>
            {selectedEmoji && (
              <button
                type="button"
                onClick={() => setSelectedEmoji(undefined)}
                className="mt-1 text-xs text-muted-foreground hover:text-foreground"
              >
                清除選擇
              </button>
            )}
          </div>

          {/* Name input */}
          <div>
            <Input
              placeholder="分類名稱"
              {...register('name')}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {updateCategory.error && (
            <p className="text-xs text-destructive">儲存失敗，請再試一次</p>
          )}

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
