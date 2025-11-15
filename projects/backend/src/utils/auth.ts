import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { reactStartCookies } from "better-auth/react-start"
import { prisma } from "./db"

export const auth = betterAuth({
  database        : prismaAdapter(prisma, { provider: 'postgresql' }),
  plugins         : [reactStartCookies()],
  emailAndPassword: { enabled: true, minPasswordLength: 6 },
  trustedOrigins  : ["http://localhost:8000"],
});
