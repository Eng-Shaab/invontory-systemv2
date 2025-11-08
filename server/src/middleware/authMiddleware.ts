import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import type { AuthenticatedUser } from "../types/auth";
import { SESSION_COOKIE_NAME } from "../constants/auth";

interface TokenPayload {
  sessionId: string;
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

const jwtSecret = process.env.JWT_SECRET ?? (process.env.NODE_ENV !== "production" ? "dev-secret" : undefined);
if (!jwtSecret) {
  throw new Error("JWT_SECRET environment variable is required for authentication middleware.");
}

type AuthedRequest = Request & {
  user?: AuthenticatedUser;
  sessionId?: string;
};

export const authMiddleware = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
  const token = req.cookies?.[SESSION_COOKIE_NAME];

    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as TokenPayload;

    const session = await prisma.session.findUnique({
      where: { id: decoded.sessionId },
      include: { user: true },
    });

    if (!session || !session.user) {
      res.status(401).json({ message: "Session not found" });
      return;
    }

    if (session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
      res.status(401).json({ message: "Session expired" });
      return;
    }

    const authUser: AuthenticatedUser = {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    };

    req.user = authUser;
    req.sessionId = session.id;
    next();
  } catch (error) {
    console.error("Authentication middleware error", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};
