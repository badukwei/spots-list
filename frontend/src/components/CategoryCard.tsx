import type { Category } from '@/types'

interface Props {
  category: Category
  index: number
  onClick: () => void
}

export function CategoryCard({ category, index, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-lg border border-border bg-card p-5 hover:border-primary/40 hover:shadow-[0_4px_24px_rgba(212,240,74,0.06)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="text-[10px] font-medium tracking-widest text-muted-foreground mb-3 block uppercase">
        {String(index).padStart(2, '0')}
      </span>
      <p className="font-display italic text-lg leading-snug text-foreground group-hover:text-primary transition-colors duration-300">
        {category.name}
      </p>
    </button>
  )
}
