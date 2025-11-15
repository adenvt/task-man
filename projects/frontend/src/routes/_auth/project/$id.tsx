import { ClientOnly, createFileRoute } from '@tanstack/react-router'
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/components/kibo-ui/kanban"
import { useEffect, useMemo, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { dateFormatter } from '@/lib/format'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreVertical, Trash } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useForm } from '@tanstack/react-form'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api'
import { useDebouncedCallback } from 'use-debounce'
import { ProjectForm } from '@/components/project-form'
import { ConfirmDelete } from '@/components/confirm-delete'

export const Route = createFileRoute('/_auth/project/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate                   = Route.useNavigate()
  const { id }                     = Route.useParams()
  const queryClient                = useQueryClient()

  const { data: project, refetch } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data } = await api.project({ id }).get()

      return data?.data
    },
  })

  type Feature = NonNullable<typeof project>['columns'][number]['cards'][number] & { name: string, column: string }

  const [features, setFeatures]               = useState<Feature[]>([])
  const [modalCard, setModalCard]             = useState(false)
  const [modelDeleteCard, setModelDeleteCard] = useState(false)
  const [cardId, setCardId]                   = useState<string>()

  const [modelProject, setModelProject]       = useState(false)
  const [modelDelete, setModelDelete]         = useState(false)

  useEffect(() => {
    if (project) {
      setFeatures(project.columns.flatMap((column) => column.cards.map((card) => ({
        ...card,
        name  : column.title,
        column: column.id,
      }))))
    }
  }, [project])

  const columns = useMemo(() => {
    return project?.columns.map((column) => ({
      id   : column.id,
      name : column.title,
      color: column.color,
    })) ?? []
  }, [project])

  const form = useForm({
    defaultValues: {
      title      : '',
      description: '',
    },
    async onSubmit({ value }) {
      if (cardId) {
        await api.project({ id })
          .card({ cardId })
          .put(value)
      } else {
        await api.project({ id })
          .card
          .post(value)
      }

      refetch()
      setModalCard(false)
    },
  })

  const addTask = () => {
    setModalCard(true)
    setCardId(undefined)

    form.reset()
  }

  const editTask = (feature: Feature) => {
    setModalCard(true)
    setCardId(feature.id)

    form.setFieldValue('title', feature.title)
    form.setFieldValue('description', feature.description ?? '')
  }

  const saveFeatures = useDebouncedCallback(async (features: Feature[]) => {
    await api.project({ id })
      .cards
      .put(features.map((feature, i) => ({
        id    : feature.id,
        order : i,
        column: feature.column,
      })))
  }, 750)

  const handleFeaturesChange = (features: Feature[]) => {
    setFeatures(features)
    saveFeatures(features)
  }

  const renameProject = () => {
    setModelProject(true)
  }

  const deleteTask = (feature: Feature) => {
    setModelDeleteCard(true)
    setCardId(feature.id)
  }

  const deleteProject = () => {
    setModelDelete(true)
  }

  const submitDelete = async () => {
    if (!project) {
      return
    }

    await api.project({ id: project.id }).delete()
    await queryClient.invalidateQueries({ queryKey: ['projects'] })

    navigate({ to: '/project' })
  }

  const submiteDeleteTask = async () => {
    if (!cardId) {
      return
    }

    await api.project({ id })
      .card({ cardId })
      .delete()

    refetch()
    setModelDeleteCard(false)
  }

  return (
    <div className='w-full h-full'>
      <div className='flex pb-4 mb-4 border-b'>
        <div className='grow'>
          <h1 className='text-2xl'>
            {project?.title}
          </h1>
        </div>
        <div className='space-x-3 shrink-0'>
          <Button
            variant={'default'}
            onClick={() => addTask()}>
            Add Task
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start">
              <DropdownMenuItem onClick={renameProject}>
                <span>Rename Project</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={deleteProject}>
                <span className="text-destructive">
                  Delete Project
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ClientOnly>
        <KanbanProvider
          columns={columns}
          data={features}
          onDataChange={handleFeaturesChange}
        >
          {(column) => (
            <KanbanBoard id={column.id} key={column.id}>
              <KanbanHeader>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: column.color as string }}
                  />
                  <span>{column.name}</span>
                </div>
              </KanbanHeader>
              <KanbanCards id={column.id}>
                {(feature: Feature) => (
                  <KanbanCard
                    column={column.id}
                    id={feature.id}
                    key={feature.id}
                    name={feature.title}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <a
                          href='#'
                          className="flex-1 m-0 text-sm font-medium hover:underline"
                          onPointerDown={(e) => { e.preventDefault() }}
                          onClick={() => { editTask(feature) }}>
                          {feature.title}
                        </a>
                      </div>
                      {feature.assigned && (
                        <Avatar className="w-4 h-4 shrink-0">
                          <AvatarImage src={feature.assigned.image ?? ''} />
                          <AvatarFallback>
                            {feature.assigned.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    <div className='flex'>
                      <p className="m-0 text-xs text-muted-foreground grow">
                        {dateFormatter.format(feature.createdAt)}
                      </p>
                      <a
                        href="#"
                        className='p-1 rounded-full text-destructive shrink-0 hover:bg-black/10'
                        onPointerDown={(e) => { e.preventDefault() }}
                        onClick={() => { deleteTask(feature) }}>
                        <Trash className='w-4 h-4' />
                      </a>
                    </div>
                  </KanbanCard>
                )}
              </KanbanCards>
            </KanbanBoard>
          )}
        </KanbanProvider>
      </ClientOnly>

      <Sheet open={modalCard} onOpenChange={setModalCard}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {cardId ? 'Edit Task' : 'New Task'}
            </SheetTitle>
            <SheetDescription>
              {cardId ? 'Edit a task in the project' : 'Add a new task to the project' }
            </SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 gap-6 px-4 auto-rows-min">
            <div className="grid gap-3">
              <form.Field name="title" children={(field) => (
                <>
                  <Label htmlFor={field.name}>Title</Label>
                  <Input
                    id={field.name}
                    defaultValue={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)} />
                </>
              )} />
            </div>
            <div className="grid gap-3">
              <form.Field name="description" children={(field) => (
                <>
                  <Label htmlFor={field.name}>Description</Label>
                  <Textarea
                    id={field.name}
                    defaultValue={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)} />
                </>
              )} />
            </div>
          </div>
          <SheetFooter>
            <Button type="submit" onClick={() => form.handleSubmit()}>
              Save
            </Button>
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ProjectForm
        data={project}
        open={modelProject}
        onOpenChange={setModelProject}
      />

      <ConfirmDelete
        title="Are you sure you want to delete this project?"
        description="This action cannot be undone."
        open={modelDelete}
        onOpenChange={setModelDelete}
        onConfirm={submitDelete}
      />

      <ConfirmDelete
        title="Are you sure you want to delete this task?"
        description="This action cannot be undone."
        open={modelDeleteCard}
        onOpenChange={setModelDeleteCard}
        onConfirm={submiteDeleteTask}
      />
    </div>
  )
}

