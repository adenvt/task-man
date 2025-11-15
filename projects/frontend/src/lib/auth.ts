import { createAuthClient } from 'better-auth/react'
import { createContext } from 'react'

export const AuthClient = createAuthClient({ baseURL: import.meta.env.VITE_BASE_API_URL })

export type AuthContextType = ReturnType<typeof AuthClient['useSession']>['data']

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
