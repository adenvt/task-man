import { auth } from '../src/utils/auth'

await auth.api.signUpEmail({
  body: {
    name    : 'Demo Account',
    email   : 'demo@example.com',
    password: '123456',
  },
})
