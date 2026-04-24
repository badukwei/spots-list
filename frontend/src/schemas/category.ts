import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(1, '名稱不能為空').max(100, '名稱不能超過 100 字'),
  emoji: z.string().max(10).optional(),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
