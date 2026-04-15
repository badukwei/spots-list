import type { Category } from '@/types'
import { ChevronRight } from 'lucide-react'

interface Props {
  category: Category
  index: number
  onClick: () => void
}

export function CategoryListItem({ category, index, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="group w-full flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3.5 hover:border-primary/40 hover:bg-muted/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="text-[10px] font-medium tracking-widest text-muted-foreground w-5 shrink-0">
        {String(index).padStart(2, '0')}
      </span>
      <span className="font-display italic text-base text-foreground group-hover:text-primary transition-colors duration-200 flex-1 text-left">
        {category.name}
      </span>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
    </button>
  )
}
