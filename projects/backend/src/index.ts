import { Elysia, status } from "elysia";
import { cors } from '@elysiajs/cors'
import { auth } from "./utils/auth"
import { createProject, deleteProject, getProjectById, getUserProjects, updateProject } from "./repositories/project";
import z from "zod";
import { createCard, deleteCard, updateCard, updateCardPosition } from "./repositories/card";
import { formProjectCard } from "./types/project";

const betterAuth = new Elysia({ name: "better-auth" })
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        })

        if (!session)
          return status(401)

        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  })

const app = new Elysia()
  .use(cors({
    origin        : "http://localhost:8000",
    methods       : ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials   : true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }))
  .use(betterAuth)
  /**
   * Get profile
   */
  .get("/me", async ({ user }) => {
    return {
      success: true,
      data   : user,
    }
  }, { auth: true })
  /**
   * Get All Projects
   */
  .get('/project', async ({ user }) => {
    const projects = await getUserProjects(user.id)

    return {
      success: true,
      data   : projects,
    }
  }, { auth: true })
  /**
   * Create Project
   */
  .post('/project', async ({ user, body }) => {
    const project = await createProject({
      title    : body.title,
      createdBy: user.id,
    })

    return {
      success: true,
      data   : project,
    }
  }, {
    auth: true,
    body: z.object({
      title: z.string(),
    }),
  })
  /**
   * Get Project details
   */
  .get('/project/:id', async ({ user, params: { id }}) => {
    const project = await getProjectById(id, user.id)

    if (!project) {
      return status(404, {
        success: false,
        message: 'Project not found',
      })
    }

    return {
      success: true,
      data   : project,
    }
  }, { auth: true })
  /**
   * Update Project
   */
  .put('/project/:id', async ({ user, body, params: { id } }) => {
    const project = await updateProject(id, {
      title: body.title,
    })

    return {
      success: true,
      data   : project,
    }
  }, {
    auth: true,
    body: z.object({
      title: z.string(),
    }),
  })
  /**
   * Delete Project
   */
  .delete('/project/:id', async ({ user, params: { id } }) => {
    const project = await deleteProject(id)

    return {
      success: true,
      data   : project,
    }
  }, { auth: true })
  /**
   * Update Card Position
   */
  .put('/project/:id/cards', async ({ user, body, params: { id } }) => {
    const cards = await updateCardPosition(body)

    return {
      success: true,
      data   : cards,
    }
  }, {
    auth: true,
    body: z.array(formProjectCard),
  })
  /**
   * Create Card
   */
  .post('/project/:id/card', async ({ user, body, params: { id } }) => {
    const card = await createCard(id, {
      title      : body.title,
      description: body.description,
    })

    return {
      success: true,
      data   : card,
    }
  }, {
    auth: true,
    body: z.object({
      title: z.string(),
      description: z.string(),
    })
  })
  /**
   * Update Card
   */
  .put('/project/:id/card/:cardId', async ({ user, body, params: { cardId } }) => {
    const card = await updateCard(cardId, {
      title      : body.title,
      description: body.description,
    })

    return {
      success: true,
      data   : card,
    }
  }, {
    auth: true,
    body: z.object({
      title: z.string(),
      description: z.string(),
    })
  })
  /**
   * Delete Card
   */
  .delete('/project/:id/card/:cardId', async ({ user, params: { cardId } }) => {
    const card = await deleteCard(cardId)

    return {
      success: true,
      data   : card,
    }
  }, { auth: true })
  /**
   * Start Server
   */
  .listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app
