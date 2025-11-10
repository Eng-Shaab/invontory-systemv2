import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dns from "dns";
import net from "net";
import { prisma } from "../lib/prisma";
import { Role } from "@prisma/client";
import { SESSION_COOKIE_NAME } from "../constants/auth";
import type { AuthenticatedUser } from "../types/auth";
import type { AuthenticatedRequest } from "../types/http";
import { recordAuditLog } from "../lib/auditLogger";
const DEFAULT_SESSION_TTL_DAYS = 7;
const DEFAULT_TOKEN_TTL_MINUTES = 10;
const disable2FA = process.env.AUTH_DISABLE_2FA === "true";

const jwtSecret = process.env.JWT_SECRET ?? (process.env.NODE_ENV !== "production" ? "dev-secret" : undefined);
if (!jwtSecret) {
  throw new Error("JWT_SECRET environment variable is required for authentication.");
}

const smtpSecure = process.env.SMTP_SECURE === "true";
const smtpPort = Number(process.env.SMTP_PORT ?? (smtpSecure ? 465 : 587));
const smtpDebug = process.env.SMTP_DEBUG === "true";

const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpSecure,
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
      // Helpful timeouts to avoid hanging forever when misconfigured
      connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT ?? 15000),
      greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT ?? 10000),
      socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT ?? 20000),
      logger: smtpDebug,
      debug: smtpDebug,
      tls: process.env.SMTP_TLS_REJECT_UNAUTHORIZED === "false" ? { rejectUnauthorized: false } : undefined,
    })
  : null;

if (smtpDebug) {
  console.log("SMTP config:", {
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpSecure,
    hasAuth: Boolean(process.env.SMTP_USER && process.env.SMTP_PASS),
  });
}

const sessionTtlDays = Number(process.env.SESSION_TTL_DAYS ?? DEFAULT_SESSION_TTL_DAYS);
const tokenTtlMinutes = Number(process.env.TWO_FACTOR_TTL_MINUTES ?? DEFAULT_TOKEN_TTL_MINUTES);

const hashCode = (code: string) => crypto.createHash("sha256").update(code).digest("hex");

const generateOneTimeCode = () => crypto.randomInt(100000, 999999).toString();

const setSessionCookie = (res: Response, token: string) => {
  const maxAgeMs = sessionTtlDays * 24 * 60 * 60 * 1000;
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: maxAgeMs,
  });
};

const sendTwoFactorEmail = async (email: string, code: string) => {
  if (!transporter) {
    console.log(`2FA code for ${email}: ${code}`);
    return;
  }

  const brand = "Sanabil Abaya";
  const formattedCode = code;
  const previewText = `Your ${brand} verification code is ${code}.`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to: email,
    subject: `${brand} sign-in verification code`,
    text:
      `${previewText}\n\nEnter this code within 10 minutes to finish signing in. If you didn't request a code, you can ignore this email.`,
    html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${brand} verification code</title>
    <style>
      body { margin:0; padding:24px 0; font-family:'Segoe UI',sans-serif; background-color:#f8fafc; color:#0f172a; }
      .container { max-width:520px; margin:0 auto; background:#ffffff; border-radius:18px; box-shadow:0 14px 40px rgba(15,23,42,0.08); overflow:hidden; }
      .header { padding:24px 28px; border-bottom:1px solid #e2e8f0; }
      .header-title { margin:0; font-size:18px; font-weight:600; color:#1d4ed8; letter-spacing:0.18em; text-transform:uppercase; }
      .content { padding:28px; font-size:14px; line-height:22px; }
      .code-block { margin:24px 0; padding:22px; border-radius:12px; background:#eff6ff; font-size:28px; font-weight:600; letter-spacing:0.4em; color:#1d4ed8; text-align:center; }
      .footer { padding:20px 28px; background:#f1f5f9; font-size:12px; color:#475569; text-align:center; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <p class="header-title">${brand}</p>
      </div>
      <div class="content">
        <p style="margin:0 0 12px;">Hello,</p>
        <p style="margin:0 0 12px;">Use the verification code below to finish signing in. This code expires in 10 minutes.</p>
  <div class="code-block">${formattedCode}</div>
        <p style="margin:0 0 12px; color:#475569;">If you did not request this code, please reset your password or contact support immediately.</p>
        <p style="margin:16px 0 0; color:#475569;">With care,<br/>The ${brand} team</p>
      </div>
      <div class="footer">
        Need assistance? Reply to this email or contact support@sanabilabaya.com.
      </div>
    </div>
  </body>
</html>`,
  });
};

const sanitizeUser = (
  user: {
    id: string;
    email: string;
    role: Role;
    name: string | null;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
  },
) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  name: user.name,
  isActive: user.isActive,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
});

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ message: "Account is disabled" });
    return;
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  // If 2FA is disabled, create the session immediately and return the user
  if (disable2FA) {
    console.log("[auth] AUTH_DISABLE_2FA active: issuing session directly for", email);
    const sessionExpiresAt = new Date(Date.now() + sessionTtlDays * 24 * 60 * 60 * 1000);
    const sessionToken = crypto.randomUUID();

    const session = await prisma.session.create({
      data: {
        token: sessionToken,
        userId: user.id,
        expiresAt: sessionExpiresAt,
      },
    });

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await recordAuditLog({
      actorId: user.id,
      targetType: "USER",
      targetId: user.id,
      action: "LOGIN_SUCCESS",
      summary: "User signed in (2FA disabled)",
    });

    const jwtToken = jwt.sign(
      {
        sessionId: session.id,
        userId: user.id,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: `${sessionTtlDays}d` },
    );

    setSessionCookie(res, jwtToken);

    res.json({ user: sanitizeUser(updatedUser) });
    return;
  }

  await prisma.twoFactorToken.deleteMany({ where: { email, usedAt: null } });

  const code = generateOneTimeCode();
  const expiresAt = new Date(Date.now() + tokenTtlMinutes * 60 * 1000);

  const tokenRecord = await prisma.twoFactorToken.create({
    data: {
      email,
      codeHash: hashCode(code),
      expiresAt,
      userId: user.id,
    },
  });

  try {
    await sendTwoFactorEmail(email, code);
  } catch (error) {
    console.error("Failed to send verification email", error);
    if (process.env.TWO_FACTOR_ALLOW_NO_EMAIL === "true") {
      // Don't block login flow; return pending token and, optionally, the code for debugging
      const response: Record<string, unknown> = {
        pendingToken: tokenRecord.id,
        message: "Verification code generated (email delivery failed)",
      };
      if (process.env.TWO_FACTOR_DEBUG_RETURN_CODE === "true") {
        response.debugCode = code;
      }
      res.json(response);
      return;
    }
    res.status(500).json({ message: "Unable to send verification code" });
    return;
  }

  res.json({ pendingToken: tokenRecord.id, message: "Verification code sent" });
};

export const verifyTwoFactorCode = async (req: Request, res: Response) => {
  const { pendingToken, code } = req.body as { pendingToken?: string; code?: string };

  if (!pendingToken || !code) {
    res.status(400).json({ message: "Verification code is required" });
    return;
  }

  const tokenRecord = await prisma.twoFactorToken.findUnique({
    where: { id: pendingToken },
    include: { user: true },
  });

  if (!tokenRecord || !tokenRecord.user) {
    res.status(400).json({ message: "Invalid verification request" });
    return;
  }

  if (tokenRecord.usedAt) {
    res.status(400).json({ message: "Verification code already used" });
    return;
  }

  if (tokenRecord.expiresAt < new Date()) {
    res.status(400).json({ message: "Verification code expired" });
    return;
  }

  const providedHash = hashCode(code);
  if (providedHash !== tokenRecord.codeHash) {
    res.status(401).json({ message: "Invalid verification code" });
    return;
  }

  const sessionExpiresAt = new Date(Date.now() + sessionTtlDays * 24 * 60 * 60 * 1000);
  const sessionToken = crypto.randomUUID();

  const session = await prisma.session.create({
    data: {
      token: sessionToken,
      userId: tokenRecord.userId,
      expiresAt: sessionExpiresAt,
    },
  });

  await prisma.twoFactorToken.update({
    where: { id: tokenRecord.id },
    data: { usedAt: new Date() },
  });

  const updatedUser = await prisma.user.update({
    where: { id: tokenRecord.userId },
    data: { lastLoginAt: new Date() },
  });

  await recordAuditLog({
    actorId: tokenRecord.userId,
    targetType: "USER",
    targetId: tokenRecord.userId,
    action: "LOGIN_SUCCESS",
    summary: "User signed in via 2FA",
  });

  const jwtToken = jwt.sign(
    {
      sessionId: session.id,
      userId: tokenRecord.userId,
      role: tokenRecord.user.role,
    },
    jwtSecret,
    { expiresIn: `${sessionTtlDays}d` },
  );

  setSessionCookie(res, jwtToken);

  res.json({ user: sanitizeUser(updatedUser) });
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  const authUser = req.user;

  if (!authUser) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: authUser.id } });

  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  res.json({ user: sanitizeUser(user) });
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  const { sessionId } = req;

  if (sessionId) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => undefined);
  }

  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.status(204).send();
};

// Optional SMTP connectivity check endpoint handler (mounted behind a route)
export const smtpCheck = async (_req: Request, res: Response) => {
  try {
    if (!process.env.SMTP_HOST) {
      res.status(200).json({ configured: false, message: "SMTP_HOST not set" });
      return;
    }
    if (!transporter) {
      res.status(200).json({ configured: false, message: "Transporter not initialized" });
      return;
    }
    // verify() checks connection configuration and logs details when debug enabled
    await transporter.verify();
    res.status(200).json({ configured: true, status: "ok" });
  } catch (error: any) {
    res.status(500).json({ configured: true, status: "error", error: error?.message ?? String(error) });
  }
};

// Deeper diagnostics: DNS resolution + raw TCP timing
export const smtpDiagnostics = async (_req: Request, res: Response) => {
  const host = process.env.SMTP_HOST;
  const port = smtpPort;
  const secure = smtpSecure;
  const result: Record<string, unknown> = { host, port, secure };
  if (!host) {
    res.status(200).json({ error: "SMTP_HOST not set" });
    return;
  }
  try {
    const startDns = Date.now();
    const addresses = await new Promise<dns.LookupAddress[]>((resolve, reject) => {
      dns.lookup(host, { all: true }, (err, addr) => (err ? reject(err) : resolve(addr)));
    });
    result.dnsMs = Date.now() - startDns;
    result.addresses = addresses;
    const addrForConnect = addresses[0]?.address ?? host;
    const startConn = Date.now();
    await new Promise<void>((resolve, reject) => {
      const socket = net.createConnection({ host: addrForConnect, port }, () => {
        result.connectMs = Date.now() - startConn;
        socket.destroy();
        resolve();
      });
      socket.setTimeout(8000, () => {
        socket.destroy();
        reject(new Error("TCP connect timeout"));
      });
      socket.on("error", (e) => {
        socket.destroy();
        reject(e);
      });
    });
    if (transporter) {
      try {
        const startVerify = Date.now();
        await transporter.verify();
        result.verifyMs = Date.now() - startVerify;
        result.verifyStatus = "ok";
      } catch (e: any) {
        result.verifyStatus = "error";
        result.verifyError = e?.message ?? String(e);
      }
    } else {
      result.verifyStatus = "no-transporter";
    }
    res.json(result);
  } catch (error: any) {
    result.error = error?.message ?? String(error);
    res.status(500).json(result);
  }
};
