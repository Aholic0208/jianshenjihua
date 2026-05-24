import Link from "next/link";
import { redirect } from "next/navigation";

import { getFitnessService, getSessionUser } from "@/lib/server-app";
import type { PlanDay } from "@/lib/types";

import { checkInAction } from "../actions";
import styles from "../routes.module.css";

type SearchParamsInput = Promise<Record<string, string | string[] | undefined>>;

type CheckInPageProps = {
  searchParams?: SearchParamsInput;
};

export default async function CheckInPage({ searchParams }: CheckInPageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth");
  }

  const params = (await searchParams) ?? {};
  const notice = readValue(params.saved) === "1" ? "今天的打卡已经保存，后续调整会参考这次反馈。" : "";
  const error = readValue(params.error);
  const dashboardData = getFitnessService().fetchLatestDashboardData(user.id);
  const plan = dashboardData.plan;
  const completedDays = new Set(
    dashboardData.recentCheckIns.filter((item) => item.completed).map((item) => item.dayIndex),
  );
  const today = plan ? getCurrentDay(plan.days, completedDays) : null;

  if (!plan || !today || plan.status === "restricted") {
    return (
      <main className={styles.shell}>
        <div className={styles.wrap}>
          <div className={styles.topbar}>
            <div>
              <p className={styles.crumb}>Daily Check-in</p>
              <h1>还没有可打卡的训练日</h1>
            </div>
            <div className={styles.actions}>
              <Link className={styles.softAction} href="/dashboard">
                返回仪表盘
              </Link>
              <Link className={styles.action} href="/onboarding">
                去完成评估
              </Link>
            </div>
          </div>

          <section className={styles.panel}>
            <p className={styles.lede}>
              只有在完成评估并生成活动计划后，这里才会出现今天的训练打卡表单。若当前被标记为受限计划，请先回到评估页更新信息。
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.shell}>
      <div className={styles.wrap}>
        <div className={styles.topbar}>
          <div>
            <p className={styles.crumb}>Daily Check-in</p>
            <h1>{today.label}</h1>
          </div>
          <div className={styles.actions}>
            <Link className={styles.softAction} href="/dashboard">
              返回仪表盘
            </Link>
            <Link className={styles.action} href="/dashboard/adjustments">
              去调整计划
            </Link>
          </div>
        </div>

        {notice ? (
          <section className={styles.panel}>
            <p className={styles.lede}>{notice}</p>
          </section>
        ) : null}

        {error ? (
          <section className={styles.panel}>
            <p className={styles.lede}>{error}</p>
          </section>
        ) : null}

        <section className={`${styles.grid} ${styles.two}`}>
          <article className={styles.panel}>
            <h2>今天的训练摘要</h2>
            <p className={styles.lede}>{today.focus}</p>
            <div className={styles.table}>
              {today.workoutItems.map((item) => (
                <div className={styles.row} key={item.id}>
                  <span>{formatWorkoutMeta(item)}</span>
                  <strong>
                    <Link href={`/dashboard/exercises/${item.exerciseId}`}>{item.name}</Link>
                  </strong>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.panel}>
            <h2>最近一次打卡</h2>
            <div className={styles.table}>
              <div className={styles.row}>
                <span>已记录天数</span>
                <strong>{completedDays.size} / {plan.days.length}</strong>
              </div>
              <div className={styles.row}>
                <span>当前热量目标</span>
                <strong>{today.nutrition.calorieTarget} kcal</strong>
              </div>
              <div className={styles.row}>
                <span>蛋白质目标</span>
                <strong>{today.nutrition.proteinGrams} g</strong>
              </div>
            </div>
          </article>
        </section>

        <section className={styles.panel}>
          <h2>提交今天的反馈</h2>
          <form action={checkInAction}>
            <input name="planId" type="hidden" value={plan.id} />
            <input name="dayIndex" type="hidden" value={String(today.dayIndex)} />

            <div className={`${styles.formGrid} ${styles.two}`}>
              <div className={styles.field}>
                <label htmlFor="completed">今天是否完成了计划？</label>
                <select defaultValue="yes" id="completed" name="completed">
                  <option value="yes">完成了</option>
                  <option value="no">没有完全完成</option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="weightKg">今日体重（kg）</label>
                <input id="weightKg" name="weightKg" placeholder="可选" step="0.1" type="number" />
              </div>

              <div className={styles.field}>
                <label htmlFor="fatigue">疲劳感（1-5）</label>
                <input defaultValue="3" id="fatigue" max="5" min="1" name="fatigue" type="range" />
              </div>

              <div className={styles.field}>
                <label htmlFor="pain">疼痛等级（0-5）</label>
                <input defaultValue="1" id="pain" max="5" min="0" name="pain" type="range" />
              </div>

              <div className={styles.field}>
                <label htmlFor="hunger">饥饿感（1-5）</label>
                <input defaultValue="3" id="hunger" max="5" min="1" name="hunger" type="range" />
              </div>

              <div className={styles.field}>
                <label htmlFor="notes">补充说明</label>
                <textarea
                  id="notes"
                  name="notes"
                  placeholder="例如：今天只完成了前两个动作，深蹲时膝盖有点不舒服。"
                />
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.action} type="submit">
                保存今天打卡
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function getCurrentDay(days: PlanDay[], completedDays: Set<number>) {
  return days.find((day) => !completedDays.has(day.dayIndex)) ?? days[days.length - 1] ?? null;
}

function formatWorkoutMeta(item: PlanDay["workoutItems"][number]) {
  if (item.sets && item.reps) {
    return `${item.sets} 组 · ${item.reps}`;
  }

  if (item.durationMinutes) {
    return `${item.durationMinutes} 分钟`;
  }

  return "查看动作";
}

function readValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}
