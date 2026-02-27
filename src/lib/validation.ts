import { z } from "zod"

export const createClipSchema = z.object({
  title: z.string().min(1).max(120),
  duration: z.number().int().nonnegative().max(300),
  tags: z.array(z.string().min(1)).max(12),
  url: z.string().url(),
  poster: z.string().url().optional()
})

export const commentSchema = z.object({
  body: z.string().min(1).max(500)
})

export type CreateClipInput = z.infer<typeof createClipSchema>

