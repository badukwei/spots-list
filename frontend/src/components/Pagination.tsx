// frontend/src/components/Pagination.tsx

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-3 mt-6 mb-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="rounded-full px-3 py-1.5 text-sm font-medium border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ← 上一頁
      </button>
      <span className="text-sm text-muted-foreground">
        第 {page} / {totalPages} 頁
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="rounded-full px-3 py-1.5 text-sm font-medium border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        下一頁 →
      </button>
    </div>
  )
}
