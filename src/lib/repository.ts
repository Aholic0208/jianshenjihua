import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";

import { exerciseLibrary } from "./exercise-library";
import type {
  AssessmentInput,
  CheckInInput,
  ExerciseMedia,
  FitnessPlan,
  PlanFaqEntry,
  PlanAdjustment,
  PlanDay,
  WorkoutItem,
} from "./types";

const require = createRequire(import.meta.url);
const { DatabaseSync } = require("node:sqlite") as typeof import("node:sqlite");
type DatabaseSyncInstance = InstanceType<typeof DatabaseSync>;

export interface AppUserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSessionRecord {
  id: string;
  userId: string;
  tokenHash: string;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
}

export interface AssessmentRecord {
  id: string;
  userId: string;
  createdAt: string;
  assessment: AssessmentInput;
}

export interface SavedPlanRecord {
  id: string;
  userId: string;
  status: FitnessPlan["status"];
  summary: string;
  disclaimer: string;
  dayCount: number;
  createdAt: string;
  safety: FitnessPlan["safety"];
  weeks: FitnessPlan["weeks"];
  days: PlanDay[];
  profile?: FitnessPlan["profile"];
  faqEntries: PlanFaqEntry[];
}

export interface CheckInRecord extends CheckInInput {
  id: string;
  createdAt: string;
}

export interface ChatMessageRecord {
  id: string;
  userId: string;
  planId: string;
  role: "user" | "assistant";
  kind: "adjustment_request" | "adjustment_response" | "general";
  content: string;
  adjustmentType?: PlanAdjustment["type"];
  replacements: WorkoutItem[];
  nutritionSuggestions: string[];
  createdAt: string;
}

export interface PlanRevisionRecord {
  id: string;
  userId: string;
  planId: string;
  dayIndex: number;
  reason: string;
  adjustmentType: PlanAdjustment["type"];
  message: string;
  replacements: WorkoutItem[];
  nutritionSuggestions: string[];
  sourceMessageId: string;
  createdAt: string;
}

export function createAppRepository(databasePath: string) {
  const database = new DatabaseSync(databasePath);
  initializeSchema(database);
  seedExerciseMedia(database);

  return {
    upsertUser(user: AppUserRecord) {
      database
        .prepare(`
          INSERT INTO users (id, name, email, password_hash, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            email = excluded.email,
            password_hash = excluded.password_hash,
            updated_at = excluded.updated_at
        `)
        .run(user.id, user.name, normalizeEmail(user.email), user.passwordHash, user.createdAt, user.updatedAt);
    },
    getUserByEmail(email: string): AppUserRecord | null {
      const row = readOne<UserRow>(
        database
          .prepare(`
            SELECT id, name, email, password_hash, created_at, updated_at
            FROM users
            WHERE email = ?
            LIMIT 1
          `)
          .get(normalizeEmail(email)),
      );

      return row ? mapUser(row) : null;
    },
    getUserById(id: string): AppUserRecord | null {
      const row = readOne<UserRow>(
        database
          .prepare(`
            SELECT id, name, email, password_hash, created_at, updated_at
            FROM users
            WHERE id = ?
            LIMIT 1
          `)
          .get(id),
      );

      return row ? mapUser(row) : null;
    },
    createSession(session: Omit<AppSessionRecord, "revokedAt">) {
      database
        .prepare(`
          INSERT INTO sessions (id, user_id, token_hash, created_at, expires_at, revoked_at)
          VALUES (?, ?, ?, ?, ?, NULL)
        `)
        .run(session.id, session.userId, session.tokenHash, session.createdAt, session.expiresAt);
    },
    getSessionByTokenHash(tokenHash: string): AppSessionRecord | null {
      const row = readOne<SessionRow>(
        database
          .prepare(`
            SELECT id, user_id, token_hash, created_at, expires_at, revoked_at
            FROM sessions
            WHERE token_hash = ?
            LIMIT 1
          `)
          .get(tokenHash),
      );

      return row ? mapSession(row) : null;
    },
    revokeSession(tokenHash: string, revokedAt: string) {
      database
        .prepare(`
          UPDATE sessions
          SET revoked_at = ?
          WHERE token_hash = ?
        `)
        .run(revokedAt, tokenHash);
    },
    saveAssessment(assessment: AssessmentInput, createdAt: string) {
      const id = randomUUID();
      database
        .prepare(`
          INSERT INTO assessments (id, user_id, assessment_json, created_at)
          VALUES (?, ?, ?, ?)
        `)
        .run(id, assessment.userId, serialize(assessment), createdAt);
    },
    getLatestAssessment(userId: string): AssessmentRecord | null {
      const row = readOne<AssessmentRow>(
        database
          .prepare(`
            SELECT id, user_id, assessment_json, created_at
            FROM assessments
            WHERE user_id = ?
            ORDER BY datetime(created_at) DESC
            LIMIT 1
          `)
          .get(userId),
      );

      return row ? mapAssessment(row) : null;
    },
    savePlan(plan: FitnessPlan) {
      database
        .prepare(`
          INSERT INTO plans (
            id, user_id, status, summary, disclaimer, safety_json, weeks_json, days_json, profile_json, faq_entries_json, day_count, created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            user_id = excluded.user_id,
            status = excluded.status,
            summary = excluded.summary,
            disclaimer = excluded.disclaimer,
            safety_json = excluded.safety_json,
            weeks_json = excluded.weeks_json,
            days_json = excluded.days_json,
            profile_json = excluded.profile_json,
            faq_entries_json = excluded.faq_entries_json,
            day_count = excluded.day_count,
            created_at = excluded.created_at
        `)
        .run(
          plan.id,
          plan.userId,
          plan.status,
          plan.summary,
          plan.disclaimer,
          serialize(plan.safety),
          serialize(plan.weeks),
          serialize(plan.days),
          serialize(plan.profile ?? null),
          serialize(plan.faqEntries ?? []),
          plan.days.length,
          plan.createdAt,
        );
    },
    getPlanById(planId: string): SavedPlanRecord | null {
      const row = readOne<PlanRow>(
        database
          .prepare(`
            SELECT id, user_id, status, summary, disclaimer, safety_json, weeks_json, days_json, profile_json, faq_entries_json, day_count, created_at
            FROM plans
            WHERE id = ?
            LIMIT 1
          `)
          .get(planId),
      );

      return row ? mapPlan(row) : null;
    },
    getLatestPlan(userId: string): SavedPlanRecord | null {
      const row = readOne<PlanRow>(
        database
          .prepare(`
            SELECT id, user_id, status, summary, disclaimer, safety_json, weeks_json, days_json, profile_json, faq_entries_json, day_count, created_at
            FROM plans
            WHERE user_id = ?
            ORDER BY datetime(created_at) DESC
            LIMIT 1
          `)
          .get(userId),
      );

      return row ? mapPlan(row) : null;
    },
    saveCheckIn(checkIn: CheckInInput, createdAt: string) {
      const id = randomUUID();
      database
        .prepare(`
          INSERT INTO check_ins (
            id, user_id, plan_id, day_index, completed, weight_kg, fatigue, pain, hunger, notes, created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          id,
          checkIn.userId,
          checkIn.planId,
          checkIn.dayIndex,
          checkIn.completed ? 1 : 0,
          checkIn.weightKg ?? null,
          checkIn.fatigue,
          checkIn.pain,
          checkIn.hunger,
          checkIn.notes ?? null,
          createdAt,
        );
    },
    listCheckInsForPlan(planId: string): CheckInRecord[] {
      const rows = readMany<CheckInRow>(
        database
          .prepare(`
            SELECT id, user_id, plan_id, day_index, completed, weight_kg, fatigue, pain, hunger, notes, created_at
            FROM check_ins
            WHERE plan_id = ?
            ORDER BY datetime(created_at) DESC
          `)
          .all(planId),
      );

      return rows.map(mapCheckIn);
    },
    saveChatMessage(message: Omit<ChatMessageRecord, "replacements" | "nutritionSuggestions"> & { replacements?: WorkoutItem[]; nutritionSuggestions?: string[] }) {
      database
        .prepare(`
          INSERT INTO chat_messages (
            id, user_id, plan_id, role, kind, content, adjustment_type, replacements_json, nutrition_suggestions_json, created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          message.id,
          message.userId,
          message.planId,
          message.role,
          message.kind,
          message.content,
          message.adjustmentType ?? null,
          serialize(message.replacements ?? []),
          serialize(message.nutritionSuggestions ?? []),
          message.createdAt,
        );
    },
    listChatMessages(planId: string): ChatMessageRecord[] {
      const rows = readMany<ChatMessageRow>(
        database
          .prepare(`
            SELECT id, user_id, plan_id, role, kind, content, adjustment_type, replacements_json, nutrition_suggestions_json, created_at
            FROM chat_messages
            WHERE plan_id = ?
            ORDER BY datetime(created_at) DESC
          `)
          .all(planId),
      );

      return rows.map(mapChatMessage);
    },
    savePlanRevision(revision: PlanRevisionRecord) {
      database
        .prepare(`
          INSERT INTO plan_revisions (
            id, user_id, plan_id, day_index, reason, adjustment_type, message, replacements_json, nutrition_suggestions_json, source_message_id, created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          revision.id,
          revision.userId,
          revision.planId,
          revision.dayIndex,
          revision.reason,
          revision.adjustmentType,
          revision.message,
          serialize(revision.replacements),
          serialize(revision.nutritionSuggestions),
          revision.sourceMessageId,
          revision.createdAt,
        );
    },
    listPlanRevisions(planId: string): PlanRevisionRecord[] {
      const rows = readMany<PlanRevisionRow>(
        database
          .prepare(`
            SELECT id, user_id, plan_id, day_index, reason, adjustment_type, message, replacements_json, nutrition_suggestions_json, source_message_id, created_at
            FROM plan_revisions
            WHERE plan_id = ?
            ORDER BY datetime(created_at) DESC
          `)
          .all(planId),
      );

      return rows.map(mapPlanRevision);
    },
    listExerciseMedia(): ExerciseMedia[] {
      const rows = readMany<ExerciseMediaRow>(
        database
          .prepare(`
            SELECT id, name, category, difficulty, environment, image_url, video_url
            FROM exercise_media
            ORDER BY name
          `)
          .all(),
      );

      return rows.map((row) => {
        const source = exerciseLibrary.find((item) => item.id === row.id);
        return {
          id: row.id,
          name: row.name,
          category: row.category,
          difficulty: row.difficulty,
          environment: row.environment,
          imageUrl: row.image_url,
          videoUrl: row.video_url,
          muscles: source?.muscles ?? [],
          equipment: source?.equipment ?? [],
          steps: source?.steps ?? [],
          cues: source?.cues ?? [],
          commonMistakes: source?.commonMistakes ?? [],
          alternatives: source?.alternatives ?? [],
          contraindications: source?.contraindications ?? [],
        };
      });
    },
  };
}

function initializeSchema(database: DatabaseSyncInstance) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      revoked_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      assessment_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS exercise_media (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      environment TEXT NOT NULL,
      image_url TEXT NOT NULL,
      video_url TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      status TEXT NOT NULL,
      summary TEXT NOT NULL,
      disclaimer TEXT NOT NULL,
      safety_json TEXT NOT NULL,
      weeks_json TEXT NOT NULL,
      days_json TEXT NOT NULL,
      profile_json TEXT,
      faq_entries_json TEXT NOT NULL DEFAULT '[]',
      day_count INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS check_ins (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      day_index INTEGER NOT NULL,
      completed INTEGER NOT NULL,
      weight_kg REAL,
      fatigue INTEGER NOT NULL,
      pain INTEGER NOT NULL,
      hunger INTEGER NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (plan_id) REFERENCES plans(id)
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      role TEXT NOT NULL,
      kind TEXT NOT NULL,
      content TEXT NOT NULL,
      adjustment_type TEXT,
      replacements_json TEXT NOT NULL,
      nutrition_suggestions_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (plan_id) REFERENCES plans(id)
    );

    CREATE TABLE IF NOT EXISTS plan_revisions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      day_index INTEGER NOT NULL DEFAULT 1,
      reason TEXT NOT NULL,
      adjustment_type TEXT NOT NULL,
      message TEXT NOT NULL,
      replacements_json TEXT NOT NULL,
      nutrition_suggestions_json TEXT NOT NULL,
      source_message_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (plan_id) REFERENCES plans(id)
    );
  `);

  ensurePlanRevisionDayIndexColumn(database);
  ensurePlanMetadataColumns(database);
}

function seedExerciseMedia(database: DatabaseSyncInstance) {
  const statement = database.prepare(`
    INSERT INTO exercise_media (id, name, category, difficulty, environment, image_url, video_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      category = excluded.category,
      difficulty = excluded.difficulty,
      environment = excluded.environment,
      image_url = excluded.image_url,
      video_url = excluded.video_url
  `);

  for (const exercise of exerciseLibrary) {
    statement.run(
      exercise.id,
      exercise.name,
      exercise.category,
      exercise.difficulty,
      exercise.environment,
      exercise.imageUrl,
      exercise.videoUrl,
    );
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function serialize(value: unknown) {
  return JSON.stringify(value);
}

function parseJson<T>(value: string): T {
  return JSON.parse(value) as T;
}

function readOne<T>(value: unknown) {
  return value as T | undefined;
}

function readMany<T>(value: unknown) {
  return value as T[];
}

function mapUser(row: UserRow): AppUserRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSession(row: SessionRow): AppSessionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at ?? null,
  };
}

function mapAssessment(row: AssessmentRow): AssessmentRecord {
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: row.created_at,
    assessment: parseJson<AssessmentInput>(row.assessment_json),
  };
}

function mapPlan(row: PlanRow): SavedPlanRecord {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    summary: row.summary,
    disclaimer: row.disclaimer,
    safety: parseJson<FitnessPlan["safety"]>(row.safety_json),
    weeks: parseJson<FitnessPlan["weeks"]>(row.weeks_json),
    days: parseJson<PlanDay[]>(row.days_json),
    profile: row.profile_json ? parseJson<FitnessPlan["profile"]>(row.profile_json) ?? undefined : undefined,
    faqEntries: row.faq_entries_json ? parseJson<PlanFaqEntry[]>(row.faq_entries_json) : [],
    dayCount: row.day_count,
    createdAt: row.created_at,
  };
}

function mapCheckIn(row: CheckInRow): CheckInRecord {
  return {
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    dayIndex: row.day_index,
    completed: row.completed === 1,
    weightKg: row.weight_kg ?? undefined,
    fatigue: row.fatigue,
    pain: row.pain,
    hunger: row.hunger,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

function mapChatMessage(row: ChatMessageRow): ChatMessageRecord {
  return {
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    role: row.role,
    kind: row.kind,
    content: row.content,
    adjustmentType: row.adjustment_type ?? undefined,
    replacements: parseJson<WorkoutItem[]>(row.replacements_json),
    nutritionSuggestions: parseJson<string[]>(row.nutrition_suggestions_json),
    createdAt: row.created_at,
  };
}

function mapPlanRevision(row: PlanRevisionRow): PlanRevisionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    dayIndex: row.day_index,
    reason: row.reason,
    adjustmentType: row.adjustment_type,
    message: row.message,
    replacements: parseJson<WorkoutItem[]>(row.replacements_json),
    nutritionSuggestions: parseJson<string[]>(row.nutrition_suggestions_json),
    sourceMessageId: row.source_message_id,
    createdAt: row.created_at,
  };
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

interface SessionRow {
  id: string;
  user_id: string;
  token_hash: string;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
}

interface AssessmentRow {
  id: string;
  user_id: string;
  assessment_json: string;
  created_at: string;
}

interface ExerciseMediaRow {
  id: string;
  name: string;
  category: ExerciseMedia["category"];
  difficulty: ExerciseMedia["difficulty"];
  environment: ExerciseMedia["environment"];
  image_url: string;
  video_url: string;
}

interface PlanRow {
  id: string;
  user_id: string;
  status: FitnessPlan["status"];
  summary: string;
  disclaimer: string;
  safety_json: string;
  weeks_json: string;
  days_json: string;
  profile_json: string | null;
  faq_entries_json: string;
  day_count: number;
  created_at: string;
}

interface CheckInRow {
  id: string;
  user_id: string;
  plan_id: string;
  day_index: number;
  completed: number;
  weight_kg: number | null;
  fatigue: number;
  pain: number;
  hunger: number;
  notes: string | null;
  created_at: string;
}

interface ChatMessageRow {
  id: string;
  user_id: string;
  plan_id: string;
  role: "user" | "assistant";
  kind: "adjustment_request" | "adjustment_response" | "general";
  content: string;
  adjustment_type: PlanAdjustment["type"] | null;
  replacements_json: string;
  nutrition_suggestions_json: string;
  created_at: string;
}

interface PlanRevisionRow {
  id: string;
  user_id: string;
  plan_id: string;
  day_index: number;
  reason: string;
  adjustment_type: PlanAdjustment["type"];
  message: string;
  replacements_json: string;
  nutrition_suggestions_json: string;
  source_message_id: string;
  created_at: string;
}

function ensurePlanRevisionDayIndexColumn(database: DatabaseSyncInstance) {
  const columns = readMany<{ name: string }>(
    database.prepare("PRAGMA table_info(plan_revisions)").all(),
  );

  if (!columns.some((column) => column.name === "day_index")) {
    database.exec("ALTER TABLE plan_revisions ADD COLUMN day_index INTEGER NOT NULL DEFAULT 1");
  }
}

function ensurePlanMetadataColumns(database: DatabaseSyncInstance) {
  const columns = readMany<{ name: string }>(
    database.prepare("PRAGMA table_info(plans)").all(),
  );

  if (!columns.some((column) => column.name === "profile_json")) {
    database.exec("ALTER TABLE plans ADD COLUMN profile_json TEXT");
  }

  if (!columns.some((column) => column.name === "faq_entries_json")) {
    database.exec("ALTER TABLE plans ADD COLUMN faq_entries_json TEXT NOT NULL DEFAULT '[]'");
  }
}
