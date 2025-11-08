import type { NextFunction, Response } from "express";
import type { Role } from "@prisma/client";
import type { AuthenticatedRequest } from "../types/http";

export const authorizeRoles = (...roles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
