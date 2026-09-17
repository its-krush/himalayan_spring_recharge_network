import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

export type SessionPayload = { openId: string; name: string; role: User["role"] };
export type AuthenticatedUser = User;

const fallbackSecret = "standalone-demo-session-secret-change-me";
const secretKey = () => new TextEncoder().encode(ENV.cookieSecret || fallbackSecret);
const now = () => new Date();

function demoUser(): User {
  const timestamp = now();
  return {
    id: 1,
    openId: "standalone-demo-admin",
    name: "Demo Administrator",
    email: null,
    loginMethod: "local-demo",
    role: "DBA",
    createdAt: timestamp,
    updatedAt: timestamp,
    lastSignedIn: timestamp,
  };
}

class LocalAuthService {
  async createSessionToken(): Promise<string> {
    return new SignJWT({ openId: "standalone-demo-admin", name: "Demo Administrator", role: "DBA" })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime(Math.floor((Date.now() + ONE_YEAR_MS) / 1000))
      .sign(secretKey());
  }

  async authenticateRequest(req: Request): Promise<AuthenticatedUser> {
    const cookies = parseCookieHeader(req.headers.cookie ?? "");
    const token = cookies[COOKIE_NAME];
    if (!token) throw new Error("Not signed in");

    try {
      const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
      if (payload.openId !== "standalone-demo-admin") throw new Error("Invalid local session");
      const user = demoUser();
      await db.upsertUser(user).catch(() => undefined);
      return user;
    } catch {
      throw new Error("Invalid local session");
    }
  }
}

export const sdk = new LocalAuthService();
