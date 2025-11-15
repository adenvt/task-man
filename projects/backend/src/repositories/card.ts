import { prisma } from "../utils/db"
import { Prisma } from "../generated/prisma/client"
import z from "zod"
import { formProjectCard } from "../types/project"

export async function createCard (projectId: string, data: Pick<Prisma.CardUncheckedCreateInput, 'title' | 'description'>) {
  const columns = await prisma.column.findFirstOrThrow({
    where: { order: 0, projectId }
  })

  return await prisma.card.create({
    data: {
      ...data,
      statusId: columns.id
    }
  })
}

export async function updateCard (id: string, data: Prisma.CardUncheckedUpdateInput) {
  return await prisma.card.update({
    where: {
      id,
    },
    data,
  })
}

export async function updateCardPosition (data: z.infer<typeof formProjectCard>[]) {
  const outputs = await prisma.$transaction(data.map((card) => {
    return prisma.card.update({
      where: {
        id: card.id
      },
      data: {
        order   : card.order,
        statusId: card.column,
      }
    })
  }))

  return outputs
}

export async function deleteCard (id: string) {
  return await prisma.card.delete({
    where: {
      id,
    },
  })
}
