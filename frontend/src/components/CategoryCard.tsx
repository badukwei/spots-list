// frontend/src/components/CategoryCard.tsx
import { Pencil } from 'lucide-react'
import type { Category } from '@/types'
import { getAutoEmoji, getCategoryColor } from '@/lib/emoji'

interface Props {
  category: Category
  index: number
  onClick: () => void
  onEdit?: () => void
}

export function CategoryCard({ category, index, onClick, onEdit }: Props) {
  const color = getCategoryColor(index)
  const emoji = category.emoji ?? getAutoEmoji(index)

  return (
    <button
      onClick={onClick}
      className="group relative w-full text-left rounded-xl border border-border bg-card p-4 hover:border-gray-200 hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {onEdit && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit() }}
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="編輯分類"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      )}
      <div
        className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-xl"
        style={{ background: color.bg }}
      >
        {emoji}
      </div>
      <p className="font-semibold text-sm text-foreground leading-snug group-hover:text-primary transition-colors duration-200">
        {category.name}
      </p>
    </button>
  )
}
