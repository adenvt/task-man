import { useForm } from "@tanstack/react-form";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

type Props = React.ComponentProps<typeof Dialog> & {
  data?: {
    id: string,
    title: string,
  },
  onSuccess?: () => void
}

export function ProjectForm ({ data, ...props }: Props) {
  const queryClient = useQueryClient()

  const form = useForm({
    defaultValues: {
      title: data?.title ?? '',
    },
    async onSubmit({ value }) {
      if (data?.id) {
        await api.project({ id: data.id }).put(value)
        await queryClient.invalidateQueries({ queryKey: ['project', data.id] })
      } else {
        await api.project.post(value)
      }

      props.onSuccess?.()
      props.onOpenChange?.(false)
    }
  })

  useEffect(() => {
    form.reset({
      title: data?.title ?? '',
    })
  }, [data])

  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{data?.id ? 'Rename project' : 'Create project'}</DialogTitle>
          <DialogDescription>
            {data?.id ? 'Change your project name' : 'Create a new project'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <form.Field name="title" children={(field) => (
              <>
                <Label htmlFor={field.name}>Name</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.setValue(e.target.value) }
                />
              </>
            )} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            type="submit"
            onClick={() => form.handleSubmit()}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
