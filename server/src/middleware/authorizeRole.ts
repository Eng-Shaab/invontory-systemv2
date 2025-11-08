import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import type { AuthenticatedUser } from "../types/auth";

type AuthedRequest = Request & {
  user?: AuthenticatedUser;
};

export const authorizeRoles = (...roles: Role[]) => {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!roles.includes(user.role)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    next();
  };
};
