// frontend/src/components/CategoryCard.tsx
import type { Category } from '@/types'
import { getAutoEmoji, getCategoryColor } from '@/lib/emoji'

interface Props {
  category: Category
  index: number
  onClick: () => void
}

export function CategoryCard({ category, index, onClick }: Props) {
  const color = getCategoryColor(index)
  const emoji = getAutoEmoji(index)

  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-xl border border-border bg-card p-4 hover:border-gray-200 hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
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
