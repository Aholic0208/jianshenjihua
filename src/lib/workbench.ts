import type { CheckInRecord, PlanRevisionRecord, SavedPlanRecord } from "./repository";
import type { DayPlannerCard, PlanWeekSummary, SelectedWorkbenchDay, WorkoutWorkbench } from "./types";

export function buildWorkoutWorkbench(input: {
  plan: SavedPlanRecord;
  selectedWeek?: number;
  selectedDayIndex?: number;
  checkIns: CheckInRecord[];
  revisions: PlanRevisionRecord[];
}): WorkoutWorkbench {
  const completedDays = new Set(input.checkIns.filter((item) => item.completed).map((item) => item.dayIndex));
  const selectedWeekNumber = clampWeek(input.plan, input.selectedWeek ?? input.plan.weeks[0]?.week ?? 1);
  const selectedWeek = input.plan.weeks.find((week) => week.week === selectedWeekNumber) ?? input.plan.weeks[0];
  const weekDays = input.plan.days.filter((day) => day.week === selectedWeek.week);
  const selectedDayIndex = resolveSelectedDayIndex(weekDays, input.selectedDayIndex);

  const days = weekDays.map<DayPlannerCard>((day) => ({
    dayIndex: day.dayIndex,
    week: day.week,
    label: day.label,
    shortLabel: `Day ${day.dayIndex - (day.week - 1) * 7}`,
    focus: day.focus,
    state: completedDays.has(day.dayIndex)
      ? "completed"
      : selectedDayIndex === day.dayIndex
        ? "current"
        : day.focus.includes("恢复")
          ? "recovery"
          : "upcoming",
    workoutCount: day.workoutItems.length,
  }));

  const selectedDay = input.plan.days.find((day) => day.dayIndex === selectedDayIndex) ?? null;
  const latestCheckIn = input.checkIns.find((item) => item.dayIndex === selectedDayIndex) ?? input.checkIns[0] ?? null;
  const latestRevision = input.revisions[0] ?? null;
  const selectedDayRevision = input.revisions.find((item) => item.dayIndex === selectedDayIndex) ?? null;
  const selectedDayDetail: SelectedWorkbenchDay | null = selectedDay
    ? {
        ...selectedDay,
        shortLabel: `Day ${selectedDay.dayIndex - (selectedDay.week - 1) * 7}`,
        state: days.find((day) => day.dayIndex === selectedDay.dayIndex)?.state ?? "upcoming",
        completed: completedDays.has(selectedDay.dayIndex),
        latestCheckInSummary: latestCheckIn
          ? `完成 ${latestCheckIn.completed ? "是" : "否"} · 疲劳 ${latestCheckIn.fatigue}/5 · 疼痛 ${latestCheckIn.pain}/5`
          : null,
        latestRevisionMessage: selectedDayRevision?.message ?? null,
        latestRevision: selectedDayRevision
          ? {
              dayIndex: selectedDayRevision.dayIndex,
              adjustmentType: selectedDayRevision.adjustmentType,
              message: selectedDayRevision.message,
              replacements: selectedDayRevision.replacements,
              nutritionSuggestions: selectedDayRevision.nutritionSuggestions,
            }
          : null,
      }
    : null;

  return {
    weeks: input.plan.weeks.map<PlanWeekSummary>((week) => ({
      week: week.week,
      title: week.title,
      goal: week.goal,
      emphasis: week.emphasis ?? [],
    })),
    selectedWeek: {
      week: selectedWeek.week,
      title: selectedWeek.title,
      goal: selectedWeek.goal,
      emphasis: selectedWeek.emphasis ?? [],
    },
    days,
    selectedDay: selectedDayDetail,
    latestRevisionMessage: latestRevision?.message ?? null,
    latestCheckInSummary: latestCheckIn ? `疲劳 ${latestCheckIn.fatigue}/5 · 疼痛 ${latestCheckIn.pain}/5` : null,
  };
}

function clampWeek(plan: SavedPlanRecord, selectedWeek: number) {
  const min = plan.weeks[0]?.week ?? 1;
  const max = plan.weeks[plan.weeks.length - 1]?.week ?? min;
  return Math.min(max, Math.max(min, selectedWeek));
}

function resolveSelectedDayIndex(days: SavedPlanRecord["days"], selectedDayIndex?: number) {
  const defaultDay = days[0]?.dayIndex ?? 1;
  if (!selectedDayIndex) {
    return defaultDay;
  }

  return days.some((day) => day.dayIndex === selectedDayIndex) ? selectedDayIndex : defaultDay;
}
