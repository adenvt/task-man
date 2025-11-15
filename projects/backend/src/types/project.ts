import { z } from 'zod'

export const formProjectCard = z.object({
  id    : z.string(),
  order : z.number(),
  column: z.string(),
})
