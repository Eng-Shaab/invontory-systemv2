import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export interface AuditLogPayload {
  actorId?: string;
  targetType: string;
  targetId?: string;
  action: string;
  summary?: string;
  metadata?: Record<string, unknown> | null;
  snapshot?: Record<string, unknown> | null;
}

/**
 * Records an audit log entry. Failures are logged but do not throw to avoid
 * interrupting the main operation flow.
 */
export const recordAuditLog = async ({
  actorId,
  targetType,
  targetId,
  action,
  summary,
  metadata,
  snapshot,
}: AuditLogPayload) => {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: actorId ?? null,
        targetType,
        targetId: targetId ?? null,
        action,
        summary,
  metadata: metadata ? (metadata as Prisma.JsonObject) : undefined,
  snapshot: snapshot ? (snapshot as Prisma.JsonObject) : undefined,
      },
    });
  } catch (error) {
    console.error("Failed to record audit log", error);
  }
};
