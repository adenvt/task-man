import { treaty } from "@elysiajs/eden"
import { App } from "backend"

export const api = treaty<App>('localhost:3000', { fetch: { credentials: 'include' }})
