import { mkdirSync } from "node:fs";
import { join } from "node:path";

import { cookies } from "next/headers";

import { createFitnessService } from "./fitness-service";
import { createAppRepository } from "./repository";

const SESSION_COOKIE = "fitness_session";

declare global {
  // eslint-disable-next-line no-var
  var __fitnessRepository: ReturnType<typeof createAppRepository> | undefined;
  // eslint-disable-next-line no-var
  var __fitnessService: ReturnType<typeof createFitnessService> | undefined;
}

function getDatabasePath() {
  const dataDir = join(process.cwd(), "data");
  mkdirSync(dataDir, { recursive: true });
  return join(dataDir, "fitness-plan.db");
}

export function getRepository() {
  if (!globalThis.__fitnessRepository) {
    globalThis.__fitnessRepository = createAppRepository(getDatabasePath());
  }

  return globalThis.__fitnessRepository;
}

export function getFitnessService() {
  if (!globalThis.__fitnessService) {
    globalThis.__fitnessService = createFitnessService({
      repository: getRepository(),
    });
  }

  return globalThis.__fitnessService;
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return getFitnessService().getUserFromSession(token);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
