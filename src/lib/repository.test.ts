import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { generateFitnessPlan } from "./fitness";
import { createAppRepository } from "./repository";
import type { AssessmentInput, CheckInInput } from "./types";

const assessmentTemplate: AssessmentInput = {
  userId: "repo-user",
  age: 30,
  sex: "female",
  heightCm: 165,
  weightKg: 68,
  targetWeightKg: 61,
  goalText: "Build a sustainable fat-loss routine",
  experience: "beginner",
  trainingDaysPerWeek: 4,
  sessionMinutes: 40,
  trainingEnvironment: "home",
  equipment: ["mat"],
  injuries: [],
  chronicConditions: [],
  dietaryRestrictions: [],
  allergies: [],
  foodBudget: "normal",
};

describe("app repository", () => {
  it("initializes schema and seeds exercise media", () => {
    const repository = createRepository();

    const media = repository.listExerciseMedia();

    expect(media.length).toBeGreaterThan(3);
    expect(media.some((item) => item.name.length > 0)).toBe(true);
  });

  it("persists users, sessions, assessments, and full plans", () => {
    const repository = createRepository();
    const assessment = { ...assessmentTemplate };
    const plan = generateFitnessPlan(assessment);

    repository.upsertUser({
      id: assessment.userId,
      name: "Repository User",
      email: "repo@example.com",
      passwordHash: "hash:example",
      createdAt: "2026-05-24T10:00:00.000Z",
      updatedAt: "2026-05-24T10:00:00.000Z",
    });
    repository.createSession({
      id: "session-1",
      userId: assessment.userId,
      tokenHash: "token-hash-1",
      createdAt: "2026-05-24T10:01:00.000Z",
      expiresAt: "2026-05-31T10:01:00.000Z",
    });
    repository.saveAssessment(assessment, "2026-05-24T10:02:00.000Z");
    repository.savePlan(plan);

    const savedUser = repository.getUserByEmail("repo@example.com");
    const savedSession = repository.getSessionByTokenHash("token-hash-1");
    const savedAssessment = repository.getLatestAssessment(assessment.userId);
    const savedPlan = repository.getLatestPlan(assessment.userId);

    expect(savedUser?.passwordHash).toBe("hash:example");
    expect(savedSession?.userId).toBe(assessment.userId);
    expect(savedAssessment?.assessment.goalText).toBe(assessment.goalText);
    expect(savedPlan?.userId).toBe(assessment.userId);
    expect(savedPlan?.dayCount).toBe(28);
    expect(savedPlan?.days).toHaveLength(28);
    expect(savedPlan?.days[0]?.workoutItems.length).toBeGreaterThan(0);
  });

  it("returns the latest assessment and plan records for dashboard lookups", () => {
    const repository = createRepository();
    const firstAssessment = { ...assessmentTemplate, userId: "repo-user-latest", goalText: "Lose fat steadily" };
    const secondAssessment = { ...firstAssessment, goalText: "Build a leaner look for summer" };
    const firstPlan = generateFitnessPlan(firstAssessment);
    const secondPlan = generateFitnessPlan(secondAssessment);

    firstPlan.createdAt = "2026-05-24T08:00:00.000Z";
    firstPlan.summary = "first saved plan";
    secondPlan.createdAt = "2026-05-24T09:00:00.000Z";
    secondPlan.summary = "second saved plan";

    repository.upsertUser({
      id: firstAssessment.userId,
      name: "Latest User",
      email: "latest@example.com",
      passwordHash: "hash:latest",
      createdAt: "2026-05-24T07:59:00.000Z",
      updatedAt: "2026-05-24T07:59:00.000Z",
    });
    repository.saveAssessment(firstAssessment, "2026-05-24T08:01:00.000Z");
    repository.savePlan(firstPlan);
    repository.saveAssessment(secondAssessment, "2026-05-24T09:01:00.000Z");
    repository.savePlan(secondPlan);

    const latestAssessment = repository.getLatestAssessment(firstAssessment.userId);
    const latestPlan = repository.getLatestPlan(firstAssessment.userId);
    const originalPlan = repository.getPlanById(firstPlan.id);

    expect(latestAssessment?.assessment.goalText).toBe(secondAssessment.goalText);
    expect(latestPlan?.id).toBe(secondPlan.id);
    expect(latestPlan?.summary).toBe("second saved plan");
    expect(originalPlan?.id).toBe(firstPlan.id);
    expect(originalPlan?.summary).toBe("first saved plan");
  });

  it("persists check-ins, chat messages, and plan revisions in reverse chronological order", () => {
    const repository = createRepository();
    const assessment = { ...assessmentTemplate, userId: "repo-user-2" };
    const plan = generateFitnessPlan(assessment);
    const firstWorkout = plan.days[0]?.workoutItems[0];
    const secondWorkout = plan.days[1]?.workoutItems[0] ?? firstWorkout;

    repository.upsertUser({
      id: assessment.userId,
      name: "Repo Two",
      email: "repo2@example.com",
      passwordHash: "hash:example-2",
      createdAt: "2026-05-24T11:00:00.000Z",
      updatedAt: "2026-05-24T11:00:00.000Z",
    });
    repository.saveAssessment(assessment, "2026-05-24T11:01:00.000Z");
    repository.savePlan(plan);

    const firstCheckIn: CheckInInput = {
      userId: assessment.userId,
      planId: plan.id,
      dayIndex: 1,
      completed: true,
      fatigue: 2,
      pain: 1,
      hunger: 3,
      notes: "finished strong",
    };

    repository.saveCheckIn(firstCheckIn, "2026-05-24T11:02:00.000Z");
    repository.saveCheckIn(
      {
        ...firstCheckIn,
        dayIndex: 2,
        completed: false,
        notes: "ran out of time",
      },
      "2026-05-25T11:02:00.000Z",
    );

    repository.saveChatMessage({
      id: "message-1",
      userId: assessment.userId,
      planId: plan.id,
      role: "user",
      kind: "adjustment_request",
      content: "Need a lower-impact option",
      createdAt: "2026-05-25T11:03:00.000Z",
    });
    repository.saveChatMessage({
      id: "message-2",
      userId: assessment.userId,
      planId: plan.id,
      role: "assistant",
      kind: "adjustment_response",
      content: "Swap to a bridge variation.",
      adjustmentType: "exercise_swap",
      replacements: secondWorkout ? [secondWorkout] : [],
      nutritionSuggestions: [],
      createdAt: "2026-05-25T11:04:00.000Z",
    });
    repository.savePlanRevision({
      id: "revision-1",
      userId: assessment.userId,
      planId: plan.id,
      reason: "Need a lower-impact option",
      adjustmentType: "exercise_swap",
      message: "Swap to a bridge variation.",
      replacements: firstWorkout ? [firstWorkout] : [],
      nutritionSuggestions: [],
      sourceMessageId: "message-1",
      createdAt: "2026-05-25T11:05:00.000Z",
    });

    const checkIns = repository.listCheckInsForPlan(plan.id);
    const messages = repository.listChatMessages(plan.id);
    const revisions = repository.listPlanRevisions(plan.id);

    expect(checkIns.map((item) => item.dayIndex)).toEqual([2, 1]);
    expect(messages.map((item) => item.id)).toEqual(["message-2", "message-1"]);
    expect(messages[0]?.adjustmentType).toBe("exercise_swap");
    expect(revisions[0]?.sourceMessageId).toBe("message-1");
    expect(revisions[0]?.replacements.length).toBe(1);
  });

  it("stores richer plan metadata and latest revision context", () => {
    const repository = createRepository();
    const assessment = { ...assessmentTemplate, userId: "repo-rich-user" };
    const plan = generateFitnessPlan(assessment);

    plan.weeks[0] = {
      ...plan.weeks[0],
      title: "建立节奏",
      goal: "先把动作质量和训练频率稳定下来。",
      emphasis: ["动作学习", "恢复感知", "基础力量"],
    };
    plan.days[0] = {
      ...plan.days[0],
      focus: "下肢力量 + 核心稳定",
      checkInPrompt: "记录膝盖感觉、疲劳和完成度。",
    };

    repository.upsertUser({
      id: assessment.userId,
      name: "Rich Repo",
      email: "rich@example.com",
      passwordHash: "hash:rich",
      createdAt: "2026-05-24T12:00:00.000Z",
      updatedAt: "2026-05-24T12:00:00.000Z",
    });
    repository.saveAssessment(assessment, "2026-05-24T12:01:00.000Z");
    repository.savePlan(plan);
    repository.savePlanRevision({
      id: "revision-rich-1",
      userId: assessment.userId,
      planId: plan.id,
      reason: "膝盖不舒服",
      adjustmentType: "exercise_swap",
      message: "把深蹲替换为臀桥。",
      replacements: plan.days[0]?.workoutItems.slice(0, 1) ?? [],
      nutritionSuggestions: [],
      sourceMessageId: "message-rich-1",
      createdAt: "2026-05-24T12:02:00.000Z",
    });

    const latestPlan = repository.getLatestPlan(assessment.userId);
    const revisions = repository.listPlanRevisions(plan.id);

    expect(latestPlan?.weeks[0]?.title).toBe("建立节奏");
    expect(latestPlan?.weeks[0]?.emphasis).toContain("动作学习");
    expect(latestPlan?.days[0]?.focus).toBe("下肢力量 + 核心稳定");
    expect(revisions[0]?.reason).toBe("膝盖不舒服");
    expect(revisions[0]?.message).toContain("臀桥");
  });

  it("can revoke sessions without deleting stored records", () => {
    const repository = createRepository();

    repository.upsertUser({
      id: "revoke-user",
      name: "Revoke User",
      email: "revoke@example.com",
      passwordHash: "hash:revoke",
      createdAt: "2026-05-24T12:00:00.000Z",
      updatedAt: "2026-05-24T12:00:00.000Z",
    });
    repository.createSession({
      id: "session-revoke",
      userId: "revoke-user",
      tokenHash: "token-hash-revoke",
      createdAt: "2026-05-24T12:01:00.000Z",
      expiresAt: "2026-05-31T12:01:00.000Z",
    });

    repository.revokeSession("token-hash-revoke", "2026-05-24T12:05:00.000Z");

    const savedSession = repository.getSessionByTokenHash("token-hash-revoke");

    expect(savedSession?.revokedAt).toBe("2026-05-24T12:05:00.000Z");
    expect(repository.getUserById("revoke-user")?.email).toBe("revoke@example.com");
  });
});

function createRepository() {
  const dir = join(process.cwd(), "data", `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  mkdirSync(dir, { recursive: true });
  return createAppRepository(join(dir, "app.db"));
}
