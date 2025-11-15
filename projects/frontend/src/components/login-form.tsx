import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useForm } from '@tanstack/react-form'
import { AuthClient } from "@/lib/auth"
import { useNavigate } from "@tanstack/react-router"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signIn } = AuthClient
  const navigate   = useNavigate()

  const form = useForm({
    defaultValues: {
      email   : 'demo@example.com',
      password: '123456',
    },
    async onSubmit({ value }) {
      const response = await signIn.email({
        email   : value.email,
        password: value.password,
      })

      if (response.data) {
        navigate({ to: '/project' })
      }
    },
  })

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()

            form.handleSubmit()
          }}>
            <FieldGroup>
              <form.Field name="email" children={(field) => (
                <>
                  <Field>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      type="email"
                      placeholder="m@example.com"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </Field>
                </>
              )} />
              <form.Field name="password" children={(field) => (
                <>
                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor={field.name}>
                        Password
                      </FieldLabel>
                    </div>
                    <Input
                      id={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </Field>
                </>
              )} />
              <Field>
                <Button type="submit">Login</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
