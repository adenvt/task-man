
import { Card, CardDescription, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { FolderKanban } from 'lucide-react'

export const Route = createFileRoute('/_auth/project/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn : async () => {
      const { data } = await api.project.get()

      return data?.data
    },
  })

  return (
    <div className='w-full h-full'>
      <div className='flex pb-4 mb-4 border-b'>
        <div className='grow'>
          <h1 className='text-2xl'>
            Projects
          </h1>
        </div>
      </div>
      <div className='grid grid-cols-4 gap-4'>
        {projects?.map((project) => (
          <Card key={project.id} className='flex flex-col mb-4'>
            <CardHeader className='grow'>
              <CardTitle>
                <div className='flex'>
                  <Link to='/project/$id' params={{ id: project.id }} className='grow hover:underline'>
                    {project.title}
                  </Link>
                  <FolderKanban className='w-12 h-auto shrink-0' />
                </div>
              </CardTitle>
              <CardDescription>
                {project.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex space-x-1'>
                {
                  project.columns.map((column) => (
                    <div key={column.id} className='flex items-center px-2 py-1 space-x-2 text-xs border rounded-full'>
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: column.color as string }}
                      />
                      <div className='grow'>
                        {column.title}
                      </div>
                      <div className='pl-2 text-xs border-l'>
                        {column.cards.length}
                      </div>
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
