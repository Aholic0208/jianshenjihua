import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAction } from "@/app/auth/actions";
import { getFitnessService, getSessionUser } from "@/lib/server-app";
import type { AssessmentInput, PlanDay, WorkoutItem } from "@/lib/types";

type SearchParamsInput = Promise<Record<string, string | string[] | undefined>>;

type DashboardPageProps = {
  searchParams?: SearchParamsInput;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth");
  }

  const params = (await searchParams) ?? {};
  const welcome = readValue(params.welcome);
  const notice = welcome === "plan-ready"
    ? "评估已经保存，下面这份计划来自你刚刚提交的真实本地数据。"
    : welcome === "back"
      ? "欢迎回来，继续看今天的训练安排。"
      : "";

  const dashboardData = getFitnessService().fetchLatestDashboardData(user.id);
  const assessment = dashboardData.assessment;
  const plan = dashboardData.plan;
  const completedDays = new Set(
    dashboardData.recentCheckIns.filter((item) => item.completed).map((item) => item.dayIndex),
  );
  const currentDay = plan ? getCurrentDay(plan.days, completedDays) : null;
  const currentWeekDays = plan && currentDay ? plan.days.filter((day) => day.week === currentDay.week) : [];
  const latestAssistantMessages = dashboardData.recentMessages.filter((message) => message.role === "assistant").slice(0, 3);
  const latestCheckIn = dashboardData.recentCheckIns[0] ?? null;

  if (!assessment) {
    return (
      <main className="screen">
        <div className="page-frame">
          <header className="topbar">
            <Link className="brand-mark" href="/">
              体能计划
            </Link>
            <nav className="topbar-nav" aria-label="仪表盘导航">
              <Link href="/auth">账号页</Link>
              <form action={logoutAction}>
                <button className="button-secondary" type="submit">
                  退出账号
                </button>
              </form>
            </nav>
          </header>

          <section className="surface stack-md">
            <span className="status-pill">先完成评估</span>
            <h1 className="panel-title">你已经登录，但还没有可生成计划的评估信息。</h1>
            <p className="lead-text">
              先填写年龄、身高体重、训练场景、伤病与饮食边界，系统才能把训练、饮食和安全提示真正落到你自己的档案上。
            </p>
            <div className="action-row">
              <Link className="button-primary" href="/onboarding">
                立即开始评估
              </Link>
              <Link className="button-secondary" href="/auth">
                返回账号页
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="screen">
      <div className="page-frame">
        <header className="topbar">
          <Link className="brand-mark" href="/">
            体能计划
          </Link>
          <nav className="topbar-nav" aria-label="仪表盘导航">
            <Link href="/dashboard/profile">个人资料</Link>
            <Link href="/onboarding">重新评估</Link>
            <form action={logoutAction}>
              <button className="button-secondary" type="submit">
                退出账号
              </button>
            </form>
          </nav>
        </header>

        {notice ? (
          <section className="surface notice-banner is-success">
            <strong>已更新</strong>
            <p>{notice}</p>
          </section>
        ) : null}

        <section className="dashboard-shell">
          <aside className="surface dashboard-nav">
            <div className="section-heading">
              <h2>执行面板</h2>
              <p>先把今天该做什么、接下来去哪一步压缩到一个稳定入口里。</p>
            </div>

            <div className="profile-block">
              <strong>{user.name}</strong>
              <p>{user.email}</p>
              <span className="status-pill subtle-pill">
                {plan?.status === "restricted" ? "当前为受限计划" : "活动计划进行中"}
              </span>
            </div>

            <div className="list-stack">
              <div className="list-row">
                <div>
                  <strong>当前阶段</strong>
                  <p>{currentDay ? currentDay.label : "等待重新评估"}</p>
                </div>
              </div>
              <div className="list-row">
                <div>
                  <strong>已完成打卡</strong>
                  <p>{completedDays.size} / {plan?.days.length ?? 0} 天</p>
                </div>
              </div>
              <div className="list-row">
                <div>
                  <strong>训练场景</strong>
                  <p>{environmentLabel(assessment.trainingEnvironment)}</p>
                </div>
              </div>
              <div className="list-row">
                <div>
                  <strong>训练频次</strong>
                  <p>每周 {assessment.trainingDaysPerWeek} 次</p>
                </div>
              </div>
            </div>

            <div className="action-row">
              <Link className="button-primary" href="/dashboard/check-in">
                今日打卡
              </Link>
              <Link className="button-secondary" href="/dashboard/adjustments">
                调整计划
              </Link>
              <Link className="button-secondary" href="/dashboard/profile">
                查看档案
              </Link>
            </div>
          </aside>

          <div className="stack-lg">
            <section className="surface hero-surface">
              <div className="section-heading">
                <span className="status-pill">
                  {plan?.status === "restricted" ? "安全限制中" : currentDay?.label ?? "计划摘要"}
                </span>
                <h1 className="panel-title">
                  {plan?.status === "restricted"
                    ? "当前不建议继续生成高强度计划。"
                    : currentDay
                      ? `今天重点：${currentDay.focus}`
                      : "你的计划已经保存。"}
                </h1>
                <p>{plan?.summary ?? "完成评估后会在这里展示你的专属计划摘要。"}</p>
              </div>

              <div className="metric-strip">
                <div className="metric-cell">
                  <span>计划状态</span>
                  <strong>{plan?.status === "restricted" ? "需保守处理" : "活动中"}</strong>
                </div>
                <div className="metric-cell">
                  <span>当前体重 / 目标</span>
                  <strong>
                    {assessment.weightKg} kg / {assessment.targetWeightKg ? `${assessment.targetWeightKg} kg` : "未填写"}
                  </strong>
                </div>
                <div className="metric-cell">
                  <span>今日热量目标</span>
                  <strong>{currentDay?.nutrition.calorieTarget ?? "--"} kcal</strong>
                </div>
                <div className="metric-cell">
                  <span>蛋白质目标</span>
                  <strong>{currentDay?.nutrition.proteinGrams ?? "--"} g</strong>
                </div>
              </div>

              <div className="action-row">
                <Link className="button-primary" href="/dashboard/check-in">
                  完成今天打卡
                </Link>
                <Link className="button-secondary" href="/dashboard/adjustments">
                  我做不到，帮我调整
                </Link>
                <Link className="button-secondary" href="/onboarding">
                  更新评估输入
                </Link>
              </div>
            </section>

            <section className="surface">
              <div className="section-heading">
                <h2>今天该练什么</h2>
                <p>每个动作都能点进去查看标准图片、步骤、要点、常见错误和视频演示链接。</p>
              </div>

              {plan?.status === "restricted" ? (
                <div className="list-stack">
                  {plan.safety.messages.map((message) => (
                    <div className="list-row" key={message}>
                      <div>
                        <strong>{message}</strong>
                        <p>先处理安全问题，再决定是否继续生成后续训练安排。</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : currentDay ? (
                <div className="list-stack">
                  {currentDay.workoutItems.map((item) => (
                    <div className="list-row" key={item.id}>
                      <div>
                        <strong>
                          <Link className="text-link" href={`/dashboard/exercises/${item.exerciseId}`}>
                            {item.name}
                          </Link>
                        </strong>
                        <p>{formatWorkoutDescription(item)}</p>
                      </div>
                      <span className="list-meta">{formatWorkoutMeta(item)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="list-stack">
                  <div className="list-row">
                    <div>
                      <strong>还没有可执行的今日训练</strong>
                      <p>先回到评估页完成资料，系统才会展开每日动作清单。</p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="surface">
              <div className="section-heading">
                <h2>今日饮食建议</h2>
                <p>这里直接展示热量、蛋白、水分和三餐建议，后面再继续细化替换逻辑。</p>
              </div>

              {currentDay ? (
                <>
                  <div className="metric-strip">
                    <div className="metric-cell">
                      <span>热量</span>
                      <strong>{currentDay.nutrition.calorieTarget} kcal</strong>
                    </div>
                    <div className="metric-cell">
                      <span>蛋白质</span>
                      <strong>{currentDay.nutrition.proteinGrams} g</strong>
                    </div>
                    <div className="metric-cell">
                      <span>饮水</span>
                      <strong>{currentDay.nutrition.waterLiters} L</strong>
                    </div>
                    <div className="metric-cell">
                      <span>限制提醒</span>
                      <strong>{currentDay.nutrition.restrictionNotes[0] ?? "无"}</strong>
                    </div>
                  </div>

                  <div className="section-heading compact-heading">
                    <h3>三餐建议</h3>
                  </div>
                  <div className="list-stack">
                    {currentDay.nutrition.meals.map((meal) => (
                      <div className="list-row" key={meal}>
                        <div>
                          <strong>{meal}</strong>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="section-heading compact-heading">
                    <h3>可替换方案</h3>
                  </div>
                  <div className="list-stack">
                    {currentDay.nutrition.swaps.map((swap) => (
                      <div className="list-row" key={swap}>
                        <div>
                          <strong>{swap}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="list-stack">
                  <div className="list-row">
                    <div>
                      <strong>饮食建议会跟随每日计划生成</strong>
                      <p>完成评估并生成计划后，这里会展示你当天的饮食重点。</p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="surface">
              <div className="section-heading">
                <h2>本周安排</h2>
                <p>当前周视图会根据你的打卡进度标记进行中、已完成和待执行状态。</p>
              </div>
              <div className="list-stack">
                {currentWeekDays.map((day) => (
                  <div className="list-row" key={day.dayIndex}>
                    <div>
                      <strong>
                        {day.label} · {day.focus}
                      </strong>
                      <p>{day.workoutItems.map((item) => item.name).join("、")}</p>
                    </div>
                    <span className={`state-tag ${stateClassForDay(day, currentDay, completedDays)}`}>
                      {stateLabelForDay(day, currentDay, completedDays)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="stack-md">
            <section className="surface">
              <div className="section-heading">
                <h2>档案摘要</h2>
                <p>把后续调整最常用的身体信息和偏好先固定在右侧。</p>
              </div>
              <div className="list-stack">
                <div className="list-row">
                  <div>
                    <strong>身体数据</strong>
                    <p>
                      {assessment.heightCm} cm / {assessment.weightKg} kg / 目标{" "}
                      {assessment.targetWeightKg ? `${assessment.targetWeightKg} kg` : "未填写"}
                    </p>
                  </div>
                </div>
                <div className="list-row">
                  <div>
                    <strong>训练边界</strong>
                    <p>
                      {experienceLabel(assessment.experience)} · {environmentLabel(assessment.trainingEnvironment)} ·
                      每次 {assessment.sessionMinutes} 分钟
                    </p>
                  </div>
                </div>
                <div className="list-row">
                  <div>
                    <strong>目标描述</strong>
                    <p>{assessment.goalText}</p>
                  </div>
                </div>
                <div className="list-row">
                  <div>
                    <strong>饮食限制</strong>
                    <p>{joinOrFallback(assessment.dietaryRestrictions, "暂未填写")}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="surface">
              <div className="section-heading">
                <h2>安全与提醒</h2>
                <p>先告诉你现在最重要的边界，而不是把提醒藏在深层页面里。</p>
              </div>
              <div className="list-stack">
                {plan?.safety.messages.map((message) => (
                  <div className="list-row" key={message}>
                    <div>
                      <strong>{message}</strong>
                    </div>
                  </div>
                ))}
                {!plan?.safety.messages.length ? (
                  <div className="list-row">
                    <div>
                      <strong>暂无额外安全提醒</strong>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="surface">
              <div className="section-heading">
                <h2>最近反馈</h2>
                <p>打卡和计划调整都能在这里快速回看。</p>
              </div>
              <div className="list-stack">
                <div className="list-row">
                  <div>
                    <strong>最近一次打卡</strong>
                    <p>
                      {latestCheckIn
                        ? `第 ${latestCheckIn.dayIndex} 天 · 疲劳 ${latestCheckIn.fatigue}/5 · 疼痛 ${latestCheckIn.pain}/5`
                        : "还没有打卡记录"}
                    </p>
                  </div>
                </div>
                {latestAssistantMessages.map((message) => (
                  <div className="list-row" key={message.id}>
                    <div>
                      <strong>调整建议</strong>
                      <p>{message.content}</p>
                    </div>
                  </div>
                ))}
                {!latestAssistantMessages.length ? (
                  <div className="list-row">
                    <div>
                      <strong>还没有调整记录</strong>
                      <p>当你反馈“做不到”“太累”“膝盖不舒服”时，新的建议会出现在这里。</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="surface">
              <div className="section-heading">
                <h2>计划说明</h2>
                <p>{plan?.disclaimer ?? "完成评估后会展示计划说明。"}</p>
              </div>
              <div className="list-stack">
                {dashboardData.revisions.slice(0, 2).map((revision) => (
                  <div className="list-row" key={revision.id}>
                    <div>
                      <strong>{revision.adjustmentType}</strong>
                      <p>{revision.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}

function getCurrentDay(days: PlanDay[], completedDays: Set<number>) {
  return days.find((day) => !completedDays.has(day.dayIndex)) ?? days[days.length - 1] ?? null;
}

function formatWorkoutMeta(item: WorkoutItem) {
  if (item.sets && item.reps) {
    return `${item.sets} 组 · ${item.reps}`;
  }

  if (item.durationMinutes) {
    return `${item.durationMinutes} 分钟`;
  }

  return "查看详情";
}

function formatWorkoutDescription(item: WorkoutItem) {
  const cue = item.media.cues[0] ?? item.notes;
  return `${cue} ${item.notes}`;
}

function stateLabelForDay(day: PlanDay, currentDay: PlanDay | null, completedDays: Set<number>) {
  if (completedDays.has(day.dayIndex)) {
    return "已完成";
  }

  if (currentDay?.dayIndex === day.dayIndex) {
    return "进行中";
  }

  return day.focus.includes("恢复") ? "恢复日" : "待执行";
}

function stateClassForDay(day: PlanDay, currentDay: PlanDay | null, completedDays: Set<number>) {
  if (completedDays.has(day.dayIndex) || currentDay?.dayIndex === day.dayIndex) {
    return "is-training";
  }

  return day.focus.includes("恢复") ? "is-recovery" : "is-training";
}

function experienceLabel(value: AssessmentInput["experience"]) {
  return value === "intermediate" ? "有训练基础" : "新手起步";
}

function environmentLabel(value: AssessmentInput["trainingEnvironment"]) {
  if (value === "home") {
    return "居家训练";
  }

  if (value === "gym") {
    return "健身房训练";
  }

  return "居家与健身房都可";
}

function joinOrFallback(values: string[], fallback: string) {
  return values.length ? values.join("、") : fallback;
}

function readValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}
