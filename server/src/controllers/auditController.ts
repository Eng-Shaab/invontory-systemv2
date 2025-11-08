import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const listAuditLogs = async (req: Request, res: Response) => {
  const { targetType, actorId } = req.query as {
    targetType?: string;
    actorId?: string;
    limit?: string;
  };

  const limit = Math.min(Number((req.query as { limit?: string }).limit ?? 50), 200);

  const filters = [] as Record<string, unknown>[];

  if (targetType) {
    filters.push({ targetType });
  }

  if (actorId) {
    filters.push({ actorId });
  }

  const logs = await prisma.auditLog.findMany({
    where: filters.length ? { AND: filters } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      actor: true,
    },
  });

  res.json(
    logs.map((log) => ({
      id: log.id,
      targetType: log.targetType,
      targetId: log.targetId,
      action: log.action,
      summary: log.summary,
      metadata: log.metadata,
      snapshot: log.snapshot,
      createdAt: log.createdAt,
      actor: log.actor
        ? {
            id: log.actor.id,
            email: log.actor.email,
            name: log.actor.name,
          }
        : null,
    })),
  );
};
