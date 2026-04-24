// frontend/src/components/CategoryListItem.tsx
import { Pencil } from 'lucide-react'
import type { Category } from '@/types'
import { getAutoEmoji, getCategoryColor } from '@/lib/emoji'

interface Props {
  category: Category
  index: number
  isActive: boolean
  onClick: () => void
  onEdit?: () => void
}

export function CategoryListItem({ category, index, isActive, onClick, onEdit }: Props) {
  const color = getCategoryColor(index)
  const emoji = category.emoji ?? getAutoEmoji(index)

  return (
    <button
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={[
        'group relative flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive ? 'bg-accent' : 'hover:bg-muted',
      ].join(' ')}
    >
      {isActive && (
        <span className="absolute left-0 top-0 h-full w-0.5 rounded-r bg-primary" />
      )}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base"
        style={{ background: color.bg }}
      >
        {emoji}
      </div>
      <span
        className={[
          'flex-1 truncate text-sm font-medium',
          isActive ? 'text-primary' : 'text-foreground group-hover:text-foreground',
        ].join(' ')}
      >
        {category.name}
      </span>
      {onEdit && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit() }}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="編輯分類"
        >
          <Pencil className="h-3 w-3" />
        </button>
      )}
    </button>
  )
}
