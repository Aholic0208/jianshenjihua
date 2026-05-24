import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

import { generateFitnessPlan, proposePlanAdjustment } from "./fitness";
import type {
  AppSessionRecord,
  AppUserRecord,
  AssessmentRecord,
  ChatMessageRecord,
  CheckInRecord,
  PlanRevisionRecord,
  SavedPlanRecord,
} from "./repository";
import type { AssessmentInput, CheckInInput, FitnessPlan, PlanAdjustment } from "./types";

interface RepositoryContract {
  upsertUser(user: AppUserRecord): void;
  getUserByEmail(email: string): AppUserRecord | null;
  getUserById(id: string): AppUserRecord | null;
  createSession(session: Omit<AppSessionRecord, "revokedAt">): void;
  getSessionByTokenHash(tokenHash: string): AppSessionRecord | null;
  revokeSession(tokenHash: string, revokedAt: string): void;
  saveAssessment(assessment: AssessmentInput, createdAt: string): void;
  getLatestAssessment(userId: string): AssessmentRecord | null;
  savePlan(plan: FitnessPlan): void;
  getLatestPlan(userId: string): SavedPlanRecord | null;
  getPlanById(planId: string): SavedPlanRecord | null;
  saveCheckIn(checkIn: CheckInInput, createdAt: string): void;
  listCheckInsForPlan(planId: string): CheckInRecord[];
  saveChatMessage(message: Omit<ChatMessageRecord, "replacements" | "nutritionSuggestions"> & { replacements?: ChatMessageRecord["replacements"]; nutritionSuggestions?: string[] }): void;
  listChatMessages(planId: string): ChatMessageRecord[];
  savePlanRevision(revision: PlanRevisionRecord): void;
  listPlanRevisions(planId: string): PlanRevisionRecord[];
}

interface FitnessServiceOptions {
  repository: RepositoryContract;
  now?: () => Date;
}

export function createFitnessService({ repository, now = () => new Date() }: FitnessServiceOptions) {
  return {
    registerUser(input: { name: string; email: string; password: string }) {
      const email = normalizeEmail(input.email);
      if (repository.getUserByEmail(email)) {
        throw new Error("User already exists");
      }

      const timestamp = now().toISOString();
      const user: AppUserRecord = {
        id: randomUUID(),
        name: input.name.trim(),
        email,
        passwordHash: hashPassword(input.password),
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      repository.upsertUser(user);
      const session = createSession(user.id, now, repository);

      return {
        user,
        session,
      };
    },
    loginUser(input: { email: string; password: string }) {
      const user = repository.getUserByEmail(normalizeEmail(input.email));
      if (!user || !verifyPassword(input.password, user.passwordHash)) {
        throw new Error("Invalid email or password");
      }

      const session = createSession(user.id, now, repository);
      return { user, session };
    },
    getUserFromSession(token: string) {
      const session = repository.getSessionByTokenHash(hashToken(token));
      if (!session || session.revokedAt || Date.parse(session.expiresAt) <= now().getTime()) {
        return null;
      }

      return repository.getUserById(session.userId);
    },
    logout(token: string) {
      repository.revokeSession(hashToken(token), now().toISOString());
    },
    saveOnboardingAssessment(assessment: AssessmentInput) {
      repository.saveAssessment(assessment, now().toISOString());
    },
    generatePlanFromAssessment(assessment: AssessmentInput) {
      const existing = repository.getLatestAssessment(assessment.userId);
      if (!existing || existing.assessment.goalText !== assessment.goalText) {
        repository.saveAssessment(assessment, now().toISOString());
      }

      const plan = generateFitnessPlan(assessment);
      repository.savePlan(plan);
      return plan;
    },
    fetchLatestDashboardData(userId: string) {
      const assessment = repository.getLatestAssessment(userId);
      const plan = repository.getLatestPlan(userId);

      return {
        user: repository.getUserById(userId),
        assessment: assessment?.assessment ?? null,
        plan,
        today: plan?.days[0] ?? null,
        recentCheckIns: plan ? repository.listCheckInsForPlan(plan.id) : [],
        recentMessages: plan ? repository.listChatMessages(plan.id) : [],
        revisions: plan ? repository.listPlanRevisions(plan.id) : [],
      };
    },
    recordCheckIn(checkIn: CheckInInput) {
      repository.saveCheckIn(checkIn, now().toISOString());
      const plan = repository.getPlanById(checkIn.planId);
      const nextDay = plan?.days.find((day) => day.dayIndex === checkIn.dayIndex + 1) ?? null;

      return {
        plan,
        checkIn,
        today: nextDay,
      };
    },
    recordAdjustmentRequest(input: { userId: string; planId: string; dayIndex?: number; message: string }) {
      const plan = repository.getPlanById(input.planId);
      if (!plan) {
        throw new Error("Plan not found");
      }

      const userMessageId = randomUUID();
      const dayIndex = resolveTargetDayIndex(plan, input.dayIndex);
      const adjustment = proposePlanAdjustment(planToFitnessPlan(plan), input.message);
      const revisedPlan = applyAdjustmentToPlan(plan, adjustment, dayIndex, now().toISOString());
      const responseMessageId = randomUUID();
      const timestamp = now().toISOString();

      repository.saveChatMessage({
        id: userMessageId,
        userId: input.userId,
        planId: input.planId,
        role: "user",
        kind: "adjustment_request",
        content: input.message,
        createdAt: timestamp,
      });
      repository.saveChatMessage({
        id: responseMessageId,
        userId: input.userId,
        planId: input.planId,
        role: "assistant",
        kind: "adjustment_response",
        content: adjustment.message,
        adjustmentType: adjustment.type,
        replacements: adjustment.replacements,
        nutritionSuggestions: adjustment.nutritionSuggestions,
        createdAt: now().toISOString(),
      });
      repository.savePlanRevision({
        id: randomUUID(),
        userId: input.userId,
        planId: input.planId,
        dayIndex,
        reason: input.message,
        adjustmentType: adjustment.type,
        message: adjustment.message,
        replacements: adjustment.replacements,
        nutritionSuggestions: adjustment.nutritionSuggestions,
        sourceMessageId: userMessageId,
        createdAt: now().toISOString(),
      });
      repository.savePlan(planToFitnessPlan(revisedPlan));

      return {
        adjustment,
        response: {
          id: responseMessageId,
          adjustmentType: adjustment.type,
          content: adjustment.message,
        },
      };
    },
  };
}

function createSession(userId: string, now: () => Date, repository: RepositoryContract) {
  const token = randomBytes(24).toString("hex");
  const createdAt = now().toISOString();
  const expiresAt = new Date(now().getTime() + 1000 * 60 * 60 * 24 * 7).toISOString();
  const session = {
    id: randomUUID(),
    userId,
    tokenHash: hashToken(token),
    createdAt,
    expiresAt,
  };

  repository.createSession(session);

  return {
    ...session,
    token,
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) {
    return false;
  }

  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function planToFitnessPlan(plan: SavedPlanRecord): FitnessPlan {
  return {
    id: plan.id,
    userId: plan.userId,
    status: plan.status,
    summary: plan.summary,
    disclaimer: plan.disclaimer,
    safety: plan.safety,
    weeks: plan.weeks,
    days: plan.days,
    createdAt: plan.createdAt,
  };
}

function applyAdjustmentToPlan(
  plan: SavedPlanRecord,
  adjustment: PlanAdjustment,
  dayIndex: number,
  timestamp: string,
): SavedPlanRecord {
  const revisedSummary = adjustment.message ? `${plan.summary} 已根据最新反馈更新今日安排。` : plan.summary;

  if (adjustment.type === "nutrition_swap" && adjustment.nutritionSuggestions.length > 0) {
    const days = plan.days.map((day, index) =>
      day.dayIndex === dayIndex
        ? {
            ...day,
            nutrition: {
              ...day.nutrition,
              swaps: [...adjustment.nutritionSuggestions, ...day.nutrition.swaps],
            },
          }
        : day,
    );

    return {
      ...plan,
      summary: revisedSummary,
      createdAt: timestamp,
      days,
    };
  }

  if (adjustment.type === "load_adjustment") {
    const days = plan.days.map((day) =>
      day.dayIndex === dayIndex
        ? {
            ...day,
            workoutItems: day.workoutItems.map((item) => ({
              ...item,
              sets: item.sets ? Math.max(1, item.sets - 1) : item.sets,
              durationMinutes: item.durationMinutes ? Math.max(5, item.durationMinutes - 2) : item.durationMinutes,
              notes: `${item.notes} 今天已按疲劳反馈降载。`,
            })),
          }
        : day,
    );

    return {
      ...plan,
      summary: revisedSummary,
      createdAt: timestamp,
      days,
    };
  }

  if (adjustment.type === "time_adjustment") {
    const days = plan.days.map((day) =>
      day.dayIndex === dayIndex
        ? {
            ...day,
            workoutItems: compressWorkoutItems(day.workoutItems),
            checkInPrompt: "这是压缩版训练日，重点记录动作是否稳定、时间是否够用，以及是否还需要继续精简。",
          }
        : day,
    );

    return {
      ...plan,
      summary: revisedSummary,
      createdAt: timestamp,
      days,
    };
  }

  if (adjustment.type === "exercise_swap" && adjustment.replacements.length > 0) {
    const days = plan.days.map((day) => {
      if (day.dayIndex !== dayIndex) {
        return day;
      }

      const filtered = day.workoutItems.filter((item) => item.category !== "strength");
      return {
        ...day,
        workoutItems: [...adjustment.replacements, ...filtered],
      };
    });

    return {
      ...plan,
      summary: revisedSummary,
      createdAt: timestamp,
      days,
    };
  }

  return {
    ...plan,
    summary: revisedSummary,
    createdAt: timestamp,
  };
}

function resolveTargetDayIndex(plan: SavedPlanRecord, requestedDayIndex?: number) {
  if (requestedDayIndex && plan.days.some((day) => day.dayIndex === requestedDayIndex)) {
    return requestedDayIndex;
  }

  return plan.days[0]?.dayIndex ?? 1;
}

function compressWorkoutItems(items: SavedPlanRecord["days"][number]["workoutItems"]) {
  const warmup = items.find((item) => item.category === "warmup");
  const mainWork = items.filter((item) => item.category === "strength").slice(0, 2);
  const stretch = [...items].reverse().find((item) => item.category === "mobility");
  const kept = [warmup, ...mainWork, stretch].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return kept.map((item, index) => ({
    ...item,
    sets: item.sets ? Math.min(item.sets, 2) : item.sets,
    durationMinutes: item.durationMinutes
      ? Math.min(item.durationMinutes, index === 0 ? 5 : 6)
      : item.durationMinutes,
    notes: `${item.notes} 今天已切换为时间压缩版本。`,
  }));
}
