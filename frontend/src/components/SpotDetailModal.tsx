import type { Spot } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Props {
  spot: Spot | null
  onClose: () => void
}

export function SpotDetailModal({ spot, onClose }: Props) {
  return (
    <Dialog open={spot !== null} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">{spot?.name}</DialogTitle>
        </DialogHeader>
        {spot && (
          <div className="space-y-4 text-sm">
            {spot.address && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">地址</p>
                <p>{spot.address}</p>
              </div>
            )}
            {spot.mapsUrl && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">地圖</p>
                <a
                  href={spot.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2 break-all hover:text-primary/80 transition-colors"
                >
                  {spot.mapsUrl}
                </a>
              </div>
            )}
            {spot.notes && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">備註</p>
                <p className="whitespace-pre-wrap">{spot.notes}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
