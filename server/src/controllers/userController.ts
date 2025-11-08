import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { recordAuditLog } from "../lib/auditLogger";
import type { AuthenticatedUser } from "../types/auth";

const sanitizeUser = (user: {
  id: string;
  email: string;
  role: Role;
  name: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  name: user.name,
  isActive: user.isActive,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

type AuthedRequest = Request & {
  user?: AuthenticatedUser;
};

const parseRole = (role?: string): Role | null => {
  if (!role) return null;
  const normalized = role.toUpperCase();
  return normalized === Role.ADMIN || normalized === Role.USER ? (normalized as Role) : null;
};

export const listUsers = async (req: AuthedRequest, res: Response) => {
  const { search, includeInactive } = req.query as {
    search?: string;
    includeInactive?: string;
  };

  const filters = [] as Record<string, unknown>[];

  if (search) {
    filters.push({
      OR: [
        { email: { contains: search, mode: "insensitive" as const } },
        { name: { contains: search, mode: "insensitive" as const } },
      ],
    });
  }

  if (includeInactive !== "true") {
    filters.push({ isActive: true });
  }

  const users = await prisma.user.findMany({
    where: filters.length ? { AND: filters } : undefined,
    orderBy: { createdAt: "desc" },
  });

  res.json(users.map(sanitizeUser));
};

export const getUserById = async (req: AuthedRequest, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json(sanitizeUser(user));
};

export const createUser = async (req: AuthedRequest, res: Response) => {
  const { email, password, role: roleInput, name } = req.body as {
    email?: string;
    password?: string;
    role?: string;
    name?: string;
  };

  if (!email || !password || !roleInput) {
    res.status(400).json({ message: "Email, password, and role are required" });
    return;
  }

  const role = parseRole(roleInput);
  if (!role) {
    res.status(400).json({ message: "Invalid role" });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ message: "Email already in use" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      name: name ?? null,
    },
  });

  await recordAuditLog({
    actorId: req.user?.id,
    targetType: "USER",
    targetId: newUser.id,
    action: "USER_CREATED",
    summary: `Created user ${email}`,
    snapshot: {
      email,
      role,
      name: name ?? null,
      isActive: newUser.isActive,
    },
  });

  res.status(201).json(sanitizeUser(newUser));
};

export const updateUser = async (req: AuthedRequest, res: Response) => {
  const { id } = req.params;
  const { email, name, role: roleInput, password, isActive } = req.body as {
    email?: string;
    name?: string;
    role?: string;
    password?: string;
    isActive?: boolean;
  };

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (req.user?.id === id && isActive === false) {
    res.status(400).json({ message: "You cannot deactivate your own account" });
    return;
  }

  const role = roleInput ? parseRole(roleInput) : user.role;

  if (!role) {
    res.status(400).json({ message: "Invalid role" });
    return;
  }

  if (req.user?.id === id && role !== Role.ADMIN) {
    res.status(400).json({ message: "You cannot remove your own admin access" });
    return;
  }

  if (email && email !== user.email) {
    const duplicate = await prisma.user.findUnique({ where: { email } });
    if (duplicate) {
      res.status(409).json({ message: "Email already in use" });
      return;
    }
  }

  // Ensure at least one active admin remains in the system.
  const willRemainAdmin = role === Role.ADMIN;
  const willRemainActive = isActive === undefined ? user.isActive : isActive;
  if (user.role === Role.ADMIN && (!willRemainAdmin || !willRemainActive)) {
    const otherAdmins = await prisma.user.count({
      where: {
        id: { not: user.id },
        role: Role.ADMIN,
        isActive: true,
      },
    });

    if (otherAdmins === 0) {
      res.status(400).json({ message: "Cannot remove the last active admin" });
      return;
    }
  }

  const data: Record<string, unknown> = {};

  if (email) data.email = email;
  if (name !== undefined) data.name = name;
  data.role = role;

  if (isActive !== undefined) {
    data.isActive = isActive;
  }

  if (password) {
    data.passwordHash = await bcrypt.hash(password, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data,
  });

  await recordAuditLog({
    actorId: req.user?.id,
    targetType: "USER",
    targetId: updatedUser.id,
    action: "USER_UPDATED",
    summary: `Updated user ${updatedUser.email}`,
    snapshot: {
      email: updatedUser.email,
      role: updatedUser.role,
      name: updatedUser.name,
      isActive: updatedUser.isActive,
    },
  });

  res.json(sanitizeUser(updatedUser));
};

export const deleteUser = async (req: AuthedRequest, res: Response) => {
  const { id } = req.params;

  if (req.user?.id === id) {
    res.status(400).json({ message: "You cannot delete your own account" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (user.role === Role.ADMIN) {
    const otherAdmins = await prisma.user.count({
      where: {
        id: { not: user.id },
        role: Role.ADMIN,
        isActive: true,
      },
    });

    if (otherAdmins === 0) {
      res.status(400).json({ message: "Cannot delete the last active admin" });
      return;
    }
  }

  await prisma.session.deleteMany({ where: { userId: id } });
  await prisma.twoFactorToken.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });

  await recordAuditLog({
    actorId: req.user?.id,
    targetType: "USER",
    targetId: id,
    action: "USER_DELETED",
    summary: `Deleted user ${user.email}`,
    snapshot: {
      email: user.email,
      role: user.role,
      name: user.name,
    },
  });

  res.status(204).send();
};
