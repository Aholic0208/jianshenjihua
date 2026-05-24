import { createRequire } from "node:module";

import { exerciseLibrary } from "./exercise-library";
import type { ExerciseMedia, FitnessPlan } from "./types";

const require = createRequire(import.meta.url);
const { DatabaseSync } = require("node:sqlite") as typeof import("node:sqlite");
type DatabaseSyncInstance = InstanceType<typeof DatabaseSync>;

interface AppUserRecord {
  id: string;
  name: string;
  email: string;
}

interface SavedPlanRecord {
  id: string;
  userId: string;
  status: string;
  summary: string;
  dayCount: number;
  createdAt: string;
}

export function createAppRepository(databasePath: string) {
  const database = new DatabaseSync(databasePath);
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL
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
      day_count INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  seedExerciseMedia(database);

  return {
    upsertUser(user: AppUserRecord) {
      const statement = database.prepare(`
        INSERT INTO users (id, name, email)
        VALUES (?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          email = excluded.email
      `);

      statement.run(user.id, user.name, user.email);
    },
    listExerciseMedia(): ExerciseMedia[] {
      const statement = database.prepare(`
        SELECT id, name, category, difficulty, environment, image_url, video_url
        FROM exercise_media
        ORDER BY name
      `);

      const rows = statement.all() as Array<{
        id: string;
        name: string;
        category: ExerciseMedia["category"];
        difficulty: ExerciseMedia["difficulty"];
        environment: ExerciseMedia["environment"];
        image_url: string;
        video_url: string;
      }>;

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
    savePlan(plan: FitnessPlan) {
      const statement = database.prepare(`
        INSERT INTO plans (id, user_id, status, summary, day_count, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          user_id = excluded.user_id,
          status = excluded.status,
          summary = excluded.summary,
          day_count = excluded.day_count,
          created_at = excluded.created_at
      `);

      statement.run(
        plan.id,
        plan.userId,
        plan.status,
        plan.summary,
        plan.days.length,
        plan.createdAt,
      );
    },
    getLatestPlan(userId: string): SavedPlanRecord | null {
      const statement = database.prepare(`
        SELECT id, user_id, status, summary, day_count, created_at
        FROM plans
        WHERE user_id = ?
        ORDER BY datetime(created_at) DESC
        LIMIT 1
      `);

      const row = statement.get(userId) as
        | {
            id: string;
            user_id: string;
            status: string;
            summary: string;
            day_count: number;
            created_at: string;
          }
        | undefined;

      if (!row) {
        return null;
      }

      return {
        id: row.id,
        userId: row.user_id,
        status: row.status,
        summary: row.summary,
        dayCount: row.day_count,
        createdAt: row.created_at,
      };
    },
  };
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
