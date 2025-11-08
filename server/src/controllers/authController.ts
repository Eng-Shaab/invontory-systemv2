import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { prisma } from "../lib/prisma";
import { Role } from "@prisma/client";
import { SESSION_COOKIE_NAME } from "../constants/auth";
import type { AuthenticatedUser } from "../types/auth";
import { recordAuditLog } from "../lib/auditLogger";
const DEFAULT_SESSION_TTL_DAYS = 7;
const DEFAULT_TOKEN_TTL_MINUTES = 10;

const jwtSecret = process.env.JWT_SECRET ?? (process.env.NODE_ENV !== "production" ? "dev-secret" : undefined);
if (!jwtSecret) {
  throw new Error("JWT_SECRET environment variable is required for authentication.");
}

const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
    })
  : null;

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
  const digits = code.split("");
  const formattedCode = digits.join(" ");
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
      body { margin:0; padding:0; font-family:'Segoe UI',sans-serif; background-color:#f8fafc; color:#0f172a; }
      .wrapper { padding:40px 0; }
      .container { max-width:540px; margin:0 auto; background:#ffffff; border-radius:24px; overflow:hidden; box-shadow:0 24px 60px rgba(202,34,82,0.15); }
  .hero { background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 50%,#0ea5e9 100%); padding:32px; color:#eff6ff; }
      .hero h1 { margin:0; font-size:24px; font-weight:600; }
      .content { padding:32px; }
      .code { display:flex; justify-content:center; gap:12px; margin:32px 0; }
  .digit { width:56px; height:64px; border-radius:18px; background:#eff6ff; color:#1d4ed8; font-size:28px; font-weight:600; display:flex; align-items:center; justify-content:center; box-shadow:inset 0 0 0 1px rgba(37,99,235,0.25); }
  .footer { margin-top:32px; font-size:12px; color:#475569; text-align:center; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="hero">
          <p style="letter-spacing:0.4em; text-transform:uppercase; opacity:0.9; font-size:11px;">${brand}</p>
          <h1>Secure sign-in verification</h1>
          <p style="margin-top:12px; font-size:14px; max-width:360px; color:rgba(255,255,255,0.8);">Use the code below to finish signing in to your Sanabil Abaya dashboard. This code expires in 10 minutes.</p>
        </div>
        <div class="content">
          <p style="font-size:14px; line-height:22px;">Hi there,</p>
          <p style="font-size:14px; line-height:22px; margin-top:12px;">Enter this verification code in the browser window where you requested it:</p>
          <div class="code">
            ${digits.map((digit) => `<div class="digit">${digit}</div>`).join("")}
          </div>
          <p style="font-size:13px; line-height:21px; color:#475569;">If you did not request this code, someone may have tried to access your account. Please reset your password or contact support immediately.</p>
          <p style="font-size:13px; line-height:21px; color:#475569; margin-top:16px;">With care,<br/>The ${brand} team</p>
          <div class="footer">
            <p>This email was sent by ${brand}. Need help? Reply to this message or contact support@sanabilabaya.com.</p>
          </div>
        </div>
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

type AuthedRequest = Request & {
  user?: AuthenticatedUser;
  sessionId?: string;
};

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

export const getCurrentUser = async (req: AuthedRequest, res: Response) => {
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

export const logout = async (req: AuthedRequest, res: Response) => {
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
