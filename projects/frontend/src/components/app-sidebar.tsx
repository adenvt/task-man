import { ChevronUp, FolderKanban, MoreHorizontal, Plus, User2 } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { api } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { Link, useNavigate, useParams } from "@tanstack/react-router"
import { ProjectForm } from "./project-form"
import { useState } from "react"
import { ConfirmDelete } from "./confirm-delete"
import { AuthClient } from "@/lib/auth"

export function AppSidebar() {
  const params   = useParams({ from: '/_auth/project/$id', shouldThrow: false })
  const navigate = useNavigate()

  const { data: session } = AuthClient.useSession()

  const { data: projects, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn : async () => {
      const { data } = await api.project.get()

      return data?.data
    },
  })

  type Project = NonNullable<typeof projects>[number]

  const [modalOpen, setModalOpen]     = useState(false)
  const [project, setProject]         = useState<Project>()
  const [modelDelete, setModelDelete] = useState(false)

  const addProject = () => {
    setModalOpen(true)
    setProject(undefined)
  }

  const editProject = (item: Project) => {
    setModalOpen(true)
    setProject(item)
  }

  const deleteProject = (item: Project) => {
    setModelDelete(true)
    setProject(item)
  }

  const submitDelete = async () => {
    if (!project) {
      return
    }

    await api.project({ id: project.id }).delete()
    await refetch()

    if (project.id === params?.id) {
      if (projects && projects.length > 0) {
        navigate({ to: '/project/$id', params: { id: projects[0].id } })
      } else {
        navigate({ to: '/project' })
      }
    }
  }

  const logout = () => {
    AuthClient.signOut()

    navigate({ to: '/' })
  }

  return (
    <>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupAction title="Add Project" onClick={() => addProject() }>
              <Plus /> <span className="sr-only">Add Project</span>
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                {projects && projects.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to="/project/$id" params={{ id: item.id }}>
                        <FolderKanban />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction>
                          <MoreHorizontal />
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start">
                        <DropdownMenuItem onClick={() => editProject(item)}>
                          <span>Rename Project</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteProject(item)}
                          disabled={projects.length < 2}>
                          <span className="text-destructive">
                            Delete Project
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <User2 /> {session?.user?.name ?? '-'}
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="end"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem onClick={() => logout()}>
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <ProjectForm
        data={project}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={refetch}
      />
      <ConfirmDelete
        title="Are you sure you want to delete this project?"
        description="This action cannot be undone."
        open={modelDelete}
        onOpenChange={setModelDelete}
        onConfirm={submitDelete}
      />
    </>
  )
}

export default AppSidebar
