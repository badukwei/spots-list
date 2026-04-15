import { z } from 'zod'

export const spotSchema = z.object({
  name: z.string().min(1, '名稱不能為空').max(100, '名稱不能超過 100 字'),
  address: z.string().max(200, '地址不能超過 200 字').optional().or(z.literal('')),
  mapsUrl: z
    .string()
    .max(500)
    .url('請輸入有效的網址（需包含 https://）')
    .optional()
    .or(z.literal('')),
  notes: z.string().max(500, '備註不能超過 500 字').optional().or(z.literal('')),
})

export type SpotFormValues = z.infer<typeof spotSchema>
