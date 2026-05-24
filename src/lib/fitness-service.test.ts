import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { createFitnessService } from "./fitness-service";
import { createAppRepository } from "./repository";
import type { AssessmentInput } from "./types";

describe("fitness service", () => {
  it("registers users, hashes passwords, and manages local sessions", () => {
    const repository = createRepository();
    const service = createFitnessService({
      repository,
      now: createClock(),
    });

    const registration = service.registerUser({
      name: "Taylor",
      email: "TAYLOR@example.com",
      password: "StrongPass123!",
    });

    const storedUser = repository.getUserByEmail("taylor@example.com");
    const sessionUser = service.getUserFromSession(registration.session.token);

    expect(registration.user.email).toBe("taylor@example.com");
    expect(storedUser?.passwordHash).toBeTruthy();
    expect(storedUser?.passwordHash).not.toContain("StrongPass123!");
    expect(sessionUser?.id).toBe(registration.user.id);

    const login = service.loginUser({
      email: "taylor@example.com",
      password: "StrongPass123!",
    });

    expect(login.user.id).toBe(registration.user.id);
    expect(() =>
      service.loginUser({
        email: "taylor@example.com",
        password: "wrong-password",
      }),
    ).toThrow(/invalid/i);

    service.logout(login.session.token);
    expect(service.getUserFromSession(login.session.token)).toBeNull();
  });

  it("saves onboarding, persists plans, and assembles dashboard data", () => {
    const repository = createRepository();
    const service = createFitnessService({
      repository,
      now: createClock(),
    });
    const registration = service.registerUser({
      name: "Jordan",
      email: "jordan@example.com",
      password: "StrongPass123!",
    });
    const assessment = createAssessment(registration.user.id);

    service.saveOnboardingAssessment(assessment);
    const plan = service.generatePlanFromAssessment(assessment);
    const dashboard = service.fetchLatestDashboardData(registration.user.id);

    expect(plan.userId).toBe(registration.user.id);
    expect(dashboard.assessment?.goalText).toBe(assessment.goalText);
    expect(dashboard.plan?.id).toBe(plan.id);
    expect(dashboard.today?.dayIndex).toBe(1);
    expect(dashboard.recentCheckIns).toHaveLength(0);
    expect(dashboard.recentMessages).toHaveLength(0);
  });

  it("returns assessment, plan, and today after register, login, and plan generation", () => {
    const repository = createRepository();
    const service = createFitnessService({
      repository,
      now: createClock(),
    });
    const registration = service.registerUser({
      name: "Morgan",
      email: "morgan@example.com",
      password: "StrongPass123!",
    });
    const assessment = createAssessment(registration.user.id);
    const login = service.loginUser({
      email: "morgan@example.com",
      password: "StrongPass123!",
    });

    service.saveOnboardingAssessment(assessment);
    const plan = service.generatePlanFromAssessment(assessment);
    const dashboard = service.fetchLatestDashboardData(login.user.id);

    expect(login.user.id).toBe(registration.user.id);
    expect(dashboard.user?.id).toBe(registration.user.id);
    expect(dashboard.assessment?.userId).toBe(registration.user.id);
    expect(dashboard.assessment?.goalText).toBe(assessment.goalText);
    expect(dashboard.plan?.id).toBe(plan.id);
    expect(dashboard.plan?.days).toHaveLength(28);
    expect(dashboard.today?.dayIndex).toBe(1);
    expect(dashboard.today).toEqual(dashboard.plan?.days[0] ?? null);
  });

  it("records check-ins and exposes them through the dashboard and repository", () => {
    const repository = createRepository();
    const service = createFitnessService({
      repository,
      now: createClock(),
    });
    const registration = service.registerUser({
      name: "Morgan",
      email: "morgan@example.com",
      password: "StrongPass123!",
    });
    const assessment = createAssessment(registration.user.id);
    const plan = service.generatePlanFromAssessment(assessment);

    const checkInResult = service.recordCheckIn({
      userId: registration.user.id,
      planId: plan.id,
      dayIndex: 1,
      completed: true,
      fatigue: 2,
      pain: 1,
      hunger: 3,
      notes: "completed as planned",
    });
    const dashboard = service.fetchLatestDashboardData(registration.user.id);
    const savedCheckIns = repository.listCheckInsForPlan(plan.id);

    expect(checkInResult.today?.dayIndex).toBe(2);
    expect(savedCheckIns).toHaveLength(1);
    expect(savedCheckIns[0]?.userId).toBe(registration.user.id);
    expect(savedCheckIns[0]?.dayIndex).toBe(1);
    expect(savedCheckIns[0]?.notes).toBe("completed as planned");
    expect(dashboard.recentCheckIns).toHaveLength(1);
    expect(dashboard.recentCheckIns[0]?.createdAt).toBe(savedCheckIns[0]?.createdAt);
    expect(dashboard.recentCheckIns[0]?.completed).toBe(true);
  });

  it("records adjustment requests and stores paired messages plus revisions", () => {
    const repository = createRepository();
    const service = createFitnessService({
      repository,
      now: createClock(),
    });
    const registration = service.registerUser({
      name: "Alex",
      email: "alex@example.com",
      password: "StrongPass123!",
    });
    const assessment = createAssessment(registration.user.id);
    const plan = service.generatePlanFromAssessment(assessment);

    const requestMessage = "今天深蹲时膝盖疼，能不能换一个动作？";
    const adjustmentResult = service.recordAdjustmentRequest({
      userId: registration.user.id,
      planId: plan.id,
      message: requestMessage,
    });
    const dashboard = service.fetchLatestDashboardData(registration.user.id);
    const savedMessages = repository.listChatMessages(plan.id);
    const savedRevisions = repository.listPlanRevisions(plan.id);

    expect(adjustmentResult.adjustment.type).toBe("exercise_swap");
    expect(adjustmentResult.response.adjustmentType).toBe("exercise_swap");
    expect(savedMessages).toHaveLength(2);
    expect(savedMessages.map((item) => item.role)).toEqual(["assistant", "user"]);
    expect(savedMessages[1]?.content).toBe(requestMessage);
    expect(savedMessages[0]?.adjustmentType).toBe("exercise_swap");
    expect(savedMessages[0]?.replacements.length).toBeGreaterThan(0);
    expect(savedRevisions).toHaveLength(1);
    expect(savedRevisions[0]?.reason).toBe(requestMessage);
    expect(savedRevisions[0]?.sourceMessageId).toBe(savedMessages[1]?.id);
    expect(dashboard.recentCheckIns).toHaveLength(0);
    expect(dashboard.recentMessages.map((item) => item.id)).toEqual(savedMessages.map((item) => item.id));
    expect(dashboard.revisions[0]?.id).toBe(savedRevisions[0]?.id);
  });
});

function createRepository() {
  const dir = join(process.cwd(), "data", `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  mkdirSync(dir, { recursive: true });
  return createAppRepository(join(dir, "app.db"));
}

function createAssessment(userId: string): AssessmentInput {
  return {
    userId,
    age: 32,
    sex: "male",
    heightCm: 178,
    weightKg: 84,
    targetWeightKg: 78,
    goalText: "Build consistency and lose fat",
    experience: "beginner",
    trainingDaysPerWeek: 4,
    sessionMinutes: 45,
    trainingEnvironment: "both",
    equipment: ["mat", "dumbbells"],
    injuries: [],
    chronicConditions: [],
    dietaryRestrictions: [],
    allergies: [],
    foodBudget: "normal",
  };
}

function createClock() {
  let current = Date.parse("2026-05-24T09:00:00.000Z");
  return () => {
    const next = new Date(current);
    current += 60_000;
    return next;
  };
}
