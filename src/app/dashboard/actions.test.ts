import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const redirect = vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  });
  const getSessionUser = vi.fn();
  const recordCheckIn = vi.fn();
  const recordAdjustmentRequest = vi.fn();
  const getFitnessService = vi.fn(() => ({
    recordCheckIn,
    recordAdjustmentRequest,
  }));

  return {
    redirect,
    getSessionUser,
    recordCheckIn,
    recordAdjustmentRequest,
    getFitnessService,
  };
});

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/lib/server-app", () => ({
  getSessionUser: mocks.getSessionUser,
  getFitnessService: mocks.getFitnessService,
}));

import { adjustmentAction, checkInAction } from "./actions";

describe("dashboard actions", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("keeps the user on the dashboard after saving a check-in", async () => {
    mocks.getSessionUser.mockResolvedValue({ id: "user-1" });
    const formData = new FormData();
    formData.set("planId", "plan-1");
    formData.set("week", "2");
    formData.set("day", "9");
    formData.set("dayIndex", "9");
    formData.set("completed", "yes");
    formData.set("fatigue", "3");
    formData.set("pain", "1");
    formData.set("hunger", "2");

    await expect(checkInAction(formData)).rejects.toThrow(
      "REDIRECT:/dashboard?week=2&day=9&notice=check-in-saved",
    );
    expect(mocks.recordCheckIn).toHaveBeenCalledWith(
      expect.objectContaining({
        planId: "plan-1",
        dayIndex: 9,
        userId: "user-1",
      }),
    );
  });

  it("keeps the user on the dashboard after saving an adjustment request", async () => {
    mocks.getSessionUser.mockResolvedValue({ id: "user-2" });
    const formData = new FormData();
    formData.set("planId", "plan-2");
    formData.set("week", "3");
    formData.set("day", "15");
    formData.set("message", "今天膝盖不舒服，帮我换掉下肢动作。");

    await expect(adjustmentAction(formData)).rejects.toThrow(
      "REDIRECT:/dashboard?week=3&day=15&notice=adjustment-saved",
    );
    expect(mocks.recordAdjustmentRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        planId: "plan-2",
        userId: "user-2",
      }),
    );
  });

  it("returns validation errors to the current dashboard selection", async () => {
    mocks.getSessionUser.mockResolvedValue({ id: "user-3" });
    const formData = new FormData();
    formData.set("planId", "plan-3");
    formData.set("week", "4");
    formData.set("day", "22");

    await expect(adjustmentAction(formData)).rejects.toThrow(
      "REDIRECT:/dashboard?week=4&day=22&error=%E8%AF%B7%E5%85%88%E5%91%8A%E8%AF%89%E7%B3%BB%E7%BB%9F%E4%BD%A0%E9%81%87%E5%88%B0%E4%BA%86%E4%BB%80%E4%B9%88%E9%97%AE%E9%A2%98%E3%80%82",
    );
    expect(mocks.recordAdjustmentRequest).not.toHaveBeenCalled();
  });
});
