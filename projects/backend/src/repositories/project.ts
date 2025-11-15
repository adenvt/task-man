import { type Prisma } from '../generated/prisma/client'
import { prisma } from '../utils/db'

export async function createProject(data: Prisma.ProjectUncheckedCreateInput) {
  const project = await prisma.project.create({
    data: {
      ...data,
      columns: {
        create: [
          { title: "Planned", color: "#6B7280", order: 0 },
          { title: "In Progress", color: "#F59E0B", order: 1 },
          { title: "Done", color: "#10B981", order: 2 },
        ]
      },
      members: {
        create: {
          userId: data.createdBy,
        },
      },
    },
    include: {
      members: { include: { user: true } },
      columns: { include: { cards: true } },
    }
  })

  return project
}

export async function getUserProjects (userId: string) {
  const projects = await prisma.project.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: { include: { user: true } },
      columns: { include: { cards: true } },
    }
  })

  if (projects.length === 0) {
    const project = await createProject({
      title      : 'My First Project',
      description: 'This is my first project',
      createdBy  : userId,
    })

    projects.push(project)
  }

  return projects
}

export async function getProjectById (id: string, userId: string) {
  return await prisma.project.findUnique({
    where: {
      id,
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: { include: { user: true } },
      columns: { include: { cards: {
        include: { assigned: true },
        orderBy: { order: 'asc' }
      } } },
    }
  })
}

export async function updateProject (id: string, data: Prisma.ProjectUncheckedUpdateInput) {
  return await prisma.project.update({
    where: {
      id,
    },
    data,
  })
}

export async function deleteProject (id: string) {
  return await prisma.project.delete({
    where: {
      id,
    },
  })
}
