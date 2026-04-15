import type { Spot } from '@/types'
import { MapPin, ExternalLink } from 'lucide-react'

interface Props {
  spot: Spot
  onClick: () => void
}

export function SpotCard({ spot, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-lg border border-border bg-card p-5 hover:border-primary/40 hover:shadow-[0_4px_24px_rgba(212,240,74,0.06)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <p className="font-display italic text-base leading-snug text-foreground group-hover:text-primary transition-colors duration-300">
        {spot.name}
      </p>
      {spot.address && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          {spot.address}
        </p>
      )}
      {spot.mapsUrl && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-primary/70">
          <ExternalLink className="h-3 w-3 shrink-0" />
          地圖連結
        </p>
      )}
    </button>
  )
}
