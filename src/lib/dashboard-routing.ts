type NumericValue = FormDataEntryValue | string | number | null | undefined;

export type DashboardSelection = {
  week: number;
  day: number;
};

export function resolveDashboardSelection(values: {
  week?: NumericValue;
  day?: NumericValue;
  dayIndex?: NumericValue;
}): DashboardSelection {
  const dayIndex = parsePositiveInteger(values.dayIndex);
  const day = parsePositiveInteger(values.day) ?? dayIndex ?? 1;
  const derivedWeek = Math.floor((day - 1) / 7) + 1;
  const week = parsePositiveInteger(values.week) ?? derivedWeek;

  return { week, day };
}

export function buildDashboardHref(
  selection: DashboardSelection,
  options: { notice?: string; error?: string } = {},
) {
  const params = new URLSearchParams({
    week: String(selection.week),
    day: String(selection.day),
  });

  if (options.notice) {
    params.set("notice", options.notice);
  }

  if (options.error) {
    params.set("error", options.error);
  }

  return `/dashboard?${params.toString()}`;
}

export function buildExerciseHref(exerciseId: string, selection: DashboardSelection) {
  const params = new URLSearchParams({
    week: String(selection.week),
    day: String(selection.day),
  });

  return `/dashboard/exercises/${exerciseId}?${params.toString()}`;
}

function parsePositiveInteger(value: NumericValue) {
  const parsed = Number.parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}
