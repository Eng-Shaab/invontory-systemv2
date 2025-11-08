import type { Request } from "express"
import type { AuthenticatedUser } from "./auth"

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser
  sessionId?: string
}
