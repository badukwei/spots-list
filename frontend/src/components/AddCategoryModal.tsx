// frontend/src/components/AddCategoryModal.tsx
import { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { categorySchema, type CategoryFormValues } from '@/schemas/category'
import { useAddCategory, useCategories } from '@/hooks/useCategories'
import { ALL_EMOJIS } from '@/lib/emoji'
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
}

export function AddCategoryModal({ open, onClose }: Props) {
  const addCategory = useAddCategory()
  const { data: existingCategories } = useCategories()
  const [selectedEmoji, setSelectedEmoji] = useState<string | undefined>(undefined)
  const [nameValue, setNameValue] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  })

  const fuse = useMemo(() => {
    if (!existingCategories) return null
    return new Fuse(existingCategories, {
      keys: ['name'],
      threshold: 0.4,
    })
  }, [existingCategories])

  const similarCategories = useMemo(() => {
    if (!fuse || !nameValue.trim()) return []
    return fuse.search(nameValue.trim()).map((r) => r.item)
  }, [fuse, nameValue])

  const onSubmit = async (values: CategoryFormValues) => {
    await addCategory.mutateAsync({ name: values.name, emoji: selectedEmoji })
    reset()
    setSelectedEmoji(undefined)
    setNameValue('')
    onClose()
  }

  const handleClose = () => {
    reset()
    addCategory.reset()
    setSelectedEmoji(undefined)
    setNameValue('')
    onClose()
  }

  const handleOpenChange = (o: boolean) => {
    if (!o) handleClose()
  }

  // Wire name field to also update nameValue for fuzzy matching
  const nameRegister = register('name', {
    onChange: (e) => setNameValue(e.target.value),
  })

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">新增分類</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Emoji picker */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">選擇 Emoji（選填）</p>
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
              placeholder="例如：適合一個人哭的地方"
              {...nameRegister}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
            )}
            {similarCategories.length > 0 && (
              <div className="mt-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="text-xs font-medium text-amber-700">⚠️ 已有類似分類：</p>
                <ul className="mt-0.5 space-y-0.5">
                  {similarCategories.slice(0, 3).map((cat) => (
                    <li key={cat.id} className="text-xs text-amber-600">
                      「{cat.name}」
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {addCategory.error && (
            <p className="text-xs text-destructive">新增失敗，請再試一次</p>
          )}
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
