import type { Spot } from '@/types'
import { MapPin, ChevronRight } from 'lucide-react'

interface Props {
  spot: Spot
  onClick: () => void
}

export function SpotListItem({ spot, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="group w-full flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3.5 hover:border-primary/40 hover:bg-muted/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="min-w-0 flex-1">
        <p className="font-display italic text-base text-foreground group-hover:text-primary transition-colors duration-200 text-left">
          {spot.name}
        </p>
        {spot.address && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{spot.address}</span>
          </p>
        )}
      </div>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
    </button>
  )
}
