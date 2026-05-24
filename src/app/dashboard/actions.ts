"use server";

import { redirect } from "next/navigation";

import { buildDashboardHref, resolveDashboardSelection } from "@/lib/dashboard-routing";
import { getFitnessService, getSessionUser } from "@/lib/server-app";

export async function checkInAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth");
  }

  const selection = resolveDashboardSelection({
    week: formData.get("week"),
    day: formData.get("day"),
    dayIndex: formData.get("dayIndex"),
  });
  const planId = String(formData.get("planId") ?? "");
  if (!planId) {
    redirect(buildDashboardHref(selection, { error: "还没有可打卡的计划。" }));
  }

  getFitnessService().recordCheckIn({
    userId: user.id,
    planId,
    dayIndex: Number.parseInt(String(formData.get("dayIndex") ?? "1"), 10),
    completed: String(formData.get("completed") ?? "yes") === "yes",
    weightKg: optionalNumber(formData.get("weightKg")),
    fatigue: Number.parseInt(String(formData.get("fatigue") ?? "3"), 10),
    pain: Number.parseInt(String(formData.get("pain") ?? "1"), 10),
    hunger: Number.parseInt(String(formData.get("hunger") ?? "3"), 10),
    notes: String(formData.get("notes") ?? ""),
  });

  redirect(buildDashboardHref(selection, { notice: "check-in-saved" }));
}

export async function adjustmentAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth");
  }

  const selection = resolveDashboardSelection({
    week: formData.get("week"),
    day: formData.get("day"),
    dayIndex: formData.get("dayIndex"),
  });
  const planId = String(formData.get("planId") ?? "");
  const message = String(formData.get("message") ?? "").trim();

  if (!planId) {
    redirect(buildDashboardHref(selection, { error: "还没有可调整的计划。" }));
  }

  if (!message) {
    redirect(buildDashboardHref(selection, { error: "请先告诉系统你遇到了什么问题。" }));
  }

  getFitnessService().recordAdjustmentRequest({
    userId: user.id,
    planId,
    dayIndex: selection.day,
    message,
  });

  redirect(buildDashboardHref(selection, { notice: "adjustment-saved" }));
}

function optionalNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) {
    return undefined;
  }

  const parsed = Number.parseFloat(text);
  return Number.isFinite(parsed) ? parsed : undefined;
}
