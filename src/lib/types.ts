export type Sex = "male" | "female" | "other";
export type ExperienceLevel = "beginner" | "intermediate";
export type TrainingEnvironment = "home" | "gym" | "both";
export type RiskLevel = "normal" | "caution" | "medical_review" | "blocked";
export type GoalKind = "fat_loss" | "body_shape" | "muscle_gain" | "posture";
export type PlanPrimaryGoal =
  | "fat_loss_preserve_muscle"
  | "recomposition"
  | "lean_gain_strength";

export interface UploadedImageInput {
  id: string;
  kind: "current" | "target";
  url: string;
  aiSummary?: string;
}

export interface AssessmentInput {
  userId: string;
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  targetWeightKg?: number;
  goalText: string;
  goalKinds?: GoalKind[];
  experience: ExperienceLevel;
  trainingDaysPerWeek: number;
  sessionMinutes: number;
  trainingEnvironment: TrainingEnvironment;
  equipment: string[];
  injuries: string[];
  chronicConditions: string[];
  dietaryRestrictions: string[];
  allergies: string[];
  sleepHours?: number;
  foodBudget: "low" | "normal" | "high";
  uploadedImages?: UploadedImageInput[];
}

export interface SafetyAnalysis {
  canGeneratePlan: boolean;
  riskLevel: RiskLevel;
  messages: string[];
}

export interface PlanProfile {
  primaryGoal: PlanPrimaryGoal;
  environmentBias: "home" | "gym" | "mixed";
  trainingPriority: "adherence" | "hypertrophy" | "strength_hypertrophy";
  cardioPriority: "low" | "moderate" | "high";
  calorieStrategy: "deficit" | "maintenance_or_small_deficit" | "small_surplus";
}

export interface ExerciseMedia {
  id: string;
  name: string;
  category: "warmup" | "strength" | "cardio" | "mobility";
  difficulty: ExperienceLevel;
  muscles: string[];
  environment: TrainingEnvironment;
  equipment: string[];
  imageUrl: string;
  mistakeImageUrl?: string;
  videoUrl: string;
  videoTitle?: string;
  steps: string[];
  cues: string[];
  commonMistakes: string[];
  alternatives: string[];
  contraindications: string[];
}

export interface WorkoutItem {
  id: string;
  exerciseId: string;
  name: string;
  category: ExerciseMedia["category"];
  environment: TrainingEnvironment;
  sets?: number;
  reps?: string;
  durationMinutes?: number;
  restSeconds?: number;
  intensity: "easy" | "moderate" | "challenging";
  notes: string;
  media: Pick<
    ExerciseMedia,
    "imageUrl" | "mistakeImageUrl" | "videoUrl" | "videoTitle" | "steps" | "cues" | "commonMistakes" | "alternatives" | "contraindications"
  >;
}

export interface NutritionDay {
  calorieTarget: number;
  proteinGrams: number;
  waterLiters: number;
  meals: string[];
  swaps: string[];
  restrictionNotes: string[];
}

export interface PlanDay {
  dayIndex: number;
  week: number;
  label: string;
  focus: string;
  workoutItems: WorkoutItem[];
  nutrition: NutritionDay;
  checkInPrompt: string;
}

export interface PlanWeek {
  week: number;
  title: string;
  goal: string;
  emphasis?: string[];
}

export interface FitnessPlan {
  id: string;
  userId: string;
  createdAt: string;
  status: "active" | "restricted";
  safety: SafetyAnalysis;
  summary: string;
  disclaimer: string;
  weeks: PlanWeek[];
  days: PlanDay[];
}

export interface PlanAdjustment {
  type: "exercise_swap" | "nutrition_swap" | "load_adjustment" | "time_adjustment" | "safety_referral" | "general_guidance";
  message: string;
  replacements: WorkoutItem[];
  nutritionSuggestions: string[];
}

export interface RevisionPreview {
  dayIndex: number;
  adjustmentType: PlanAdjustment["type"];
  message: string;
  replacements: WorkoutItem[];
  nutritionSuggestions: string[];
}

export interface CheckInInput {
  userId: string;
  planId: string;
  dayIndex: number;
  completed: boolean;
  weightKg?: number;
  fatigue: number;
  pain: number;
  hunger: number;
  notes?: string;
}

export interface PlanWeekSummary {
  week: number;
  title: string;
  goal: string;
  emphasis: string[];
}

export interface DayPlannerCard {
  dayIndex: number;
  week: number;
  label: string;
  shortLabel: string;
  focus: string;
  state: "completed" | "current" | "upcoming" | "recovery";
  workoutCount: number;
}

export interface SelectedWorkbenchDay extends PlanDay {
  shortLabel: string;
  state: DayPlannerCard["state"];
  completed: boolean;
  latestCheckInSummary: string | null;
  latestRevisionMessage: string | null;
  latestRevision: RevisionPreview | null;
}

export interface WorkoutWorkbench {
  weeks: PlanWeekSummary[];
  selectedWeek: PlanWeekSummary;
  days: DayPlannerCard[];
  selectedDay: SelectedWorkbenchDay | null;
  latestRevisionMessage: string | null;
  latestCheckInSummary: string | null;
}
