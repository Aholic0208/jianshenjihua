import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAction } from "@/app/auth/actions";
import { adjustmentAction, checkInAction } from "@/app/dashboard/actions";
import { buildExerciseHref } from "@/lib/dashboard-routing";
import { getFitnessService, getSessionUser } from "@/lib/server-app";
import { buildWorkoutWorkbench } from "@/lib/workbench";
import type { AssessmentInput, PlanDay, WorkoutItem } from "@/lib/types";

type SearchParamsInput = Promise<Record<string, string | string[] | undefined>>;

type DashboardPageProps = {
  searchParams?: SearchParamsInput;
};

const adjustmentSuggestions = [
  "今天膝盖不舒服，帮我换掉下肢动作。",
  "我只有 25 分钟，帮我压缩今天的训练。",
  "今天太累了，帮我把训练量降一点。",
  "今天没有哑铃，只有弹力带，帮我换一下。",
  "没有鸡胸肉了，帮我换一套更容易买到的饮食方案。",
];

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth");
  }

  const params = (await searchParams) ?? {};
  const welcome = readValue(params.welcome);
  const notice = readDashboardNotice(welcome, readValue(params.notice));
  const error = readValue(params.error);
  const dashboardData = getFitnessService().fetchLatestDashboardData(user.id);
  const assessment = dashboardData.assessment;
  const plan = dashboardData.plan;

  if (!assessment) {
    return (
      <main className="screen">
        <div className="page-frame">
          <header className="topbar">
            <Link className="brand-mark" href="/">
              健身计划
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
            <span className="status-pill">先完成建档</span>
            <h1 className="panel-title">你已经登录，但还没有可生成计划的评估信息。</h1>
            <p className="lead-text">
              先把年龄、身高体重、训练场景、器械、伤病和饮食限制写清楚，系统才能把训练、饮食和安全提示真正落到你自己的档案上。
            </p>
            <div className="action-row">
              <Link className="button-primary" href="/onboarding">
                立即开始建档
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const selectedWeek = clampNumber(readValue(params.week), 1, plan?.weeks.length ?? 4);
  const fallbackDayIndex = plan ? getFirstDayIndexForWeek(plan.days, selectedWeek) : 1;
  const selectedDayIndex = clampNumber(readValue(params.day), fallbackDayIndex, plan?.days.length ?? 28);
  const workbench = plan && plan.weeks.length > 0
    ? buildWorkoutWorkbench({
        plan,
        selectedWeek,
        selectedDayIndex,
        checkIns: dashboardData.recentCheckIns,
        revisions: dashboardData.revisions,
      })
    : null;
  const selectedDay = workbench?.selectedDay ?? null;

  return (
    <main className="screen">
      <div className="page-frame">
        <header className="topbar">
          <Link className="brand-mark" href="/">
            健身计划
          </Link>
          <nav className="topbar-nav" aria-label="仪表盘导航">
            <Link href="/dashboard/profile">个人资料</Link>
            <Link href="/onboarding">重新建档</Link>
            <form action={logoutAction}>
              <button className="button-secondary" type="submit">
                退出账号
              </button>
            </form>
          </nav>
        </header>

        {error ? (
          <section className="surface notice-banner is-error">
            <strong>需要处理</strong>
            <p>{error}</p>
          </section>
        ) : null}

        {notice ? (
          <section className="surface notice-banner is-success">
            <strong>状态更新</strong>
            <p>{notice}</p>
          </section>
        ) : null}

        {!plan || plan.status === "restricted" || !workbench ? (
          <section className="planner-shell">
            <section className="surface stack-lg">
              <div className="section-heading">
                <span className="status-pill">安全边界</span>
                <h1 className="panel-title">当前不建议直接进入常规训练计划。</h1>
                <p>{plan?.summary ?? "先完成建档，系统再判断是否适合生成计划。"}</p>
              </div>

              <div className="warning-list">
                {(plan?.safety.messages ?? ["请先完成建档，再决定后续训练安排。"]).map((message) => (
                  <div className="warning-item" key={message}>
                    <strong>{message}</strong>
                  </div>
                ))}
              </div>

              <div className="action-row">
                <Link className="button-primary" href="/onboarding">
                  返回建档页
                </Link>
                <Link className="button-secondary" href="/dashboard/profile">
                  查看当前资料
                </Link>
              </div>
            </section>
          </section>
        ) : (
          <section className="planner-shell">
            <section className="surface stack-lg">
              <div className="surface-header">
                <div className="section-heading">
                  <span className="status-pill">{workbench.selectedWeek.title}</span>
                  <h1 className="panel-title">{workbench.selectedWeek.goal}</h1>
                  <p>{plan.summary}</p>
                </div>
                <div className="pill-row">
                  {workbench.selectedWeek.emphasis.map((item) => (
                    <span className="info-pill" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="stats-grid">
                <div className="planner-detail-card">
                  <span className="planner-day-label">当前体重 / 目标</span>
                  <strong>{assessment.weightKg} kg / {assessment.targetWeightKg ? `${assessment.targetWeightKg} kg` : "未填写"}</strong>
                </div>
                <div className="planner-detail-card">
                  <span className="planner-day-label">每周频率 / 时长</span>
                  <strong>{assessment.trainingDaysPerWeek} 天 / {assessment.sessionMinutes} 分钟</strong>
                </div>
                <div className="planner-detail-card">
                  <span className="planner-day-label">最新打卡</span>
                  <strong>{workbench.latestCheckInSummary ?? "还没有打卡记录"}</strong>
                </div>
                <div className="planner-detail-card">
                  <span className="planner-day-label">最近调整</span>
                  <strong>{workbench.latestRevisionMessage ?? "还没有计划调整"}</strong>
                </div>
              </div>
            </section>

            <section className="planner-grid">
              <aside className="stack-md">
                <section className="surface">
                  <div className="section-heading">
                    <h2>你的档案</h2>
                    <p>计划会根据目标、场景、器械和限制条件来分配内容。</p>
                  </div>
                  <div className="list-stack">
                    <div className="list-row">
                      <div>
                        <strong>{user.name}</strong>
                        <p>{user.email}</p>
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
                        <strong>经验水平</strong>
                        <p>{experienceLabel(assessment.experience)}</p>
                      </div>
                    </div>
                    <div className="list-row">
                      <div>
                        <strong>器械条件</strong>
                        <p>{joinOrFallback(assessment.equipment, "未填写")}</p>
                      </div>
                    </div>
                    <div className="list-row">
                      <div>
                        <strong>饮食限制</strong>
                        <p>{joinOrFallback(assessment.dietaryRestrictions, "暂无特殊限制")}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="surface">
                  <div className="section-heading">
                    <h2>安全提醒</h2>
                    <p>第一版优先保证合理和可执行，不追求激进速度。</p>
                  </div>
                  <div className="warning-list">
                    {plan.safety.messages.map((message) => (
                      <div className="warning-item" key={message}>
                        {message}
                      </div>
                    ))}
                  </div>
                  <p className="muted-copy">{plan.disclaimer}</p>
                </section>

                <section className="surface">
                  <div className="section-heading">
                    <h2>最近修订</h2>
                    <p>每次调整都会留痕，后面可以回看。</p>
                  </div>
                  <div className="list-stack">
                    {dashboardData.revisions.slice(0, 3).map((revision) => (
                      <div className="list-row" key={revision.id}>
                        <div>
                          <strong>{revision.adjustmentType}</strong>
                          <p>{revision.message}</p>
                        </div>
                      </div>
                    ))}
                    {dashboardData.revisions.length === 0 ? (
                      <div className="list-row">
                        <div>
                          <strong>还没有修订</strong>
                          <p>当你说“太累了”“膝盖不舒服”“吃不了这个”时，新的修订会出现在这里。</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </section>
              </aside>

              <div className="stack-lg">
                <section className="surface stack-md">
                  <div className="section-heading">
                    <h2>4 周计划</h2>
                    <p>先选周，再选当天，下面的训练、饮食和反馈都会随之切换。</p>
                  </div>
                  <div className="planner-week-tabs">
                    {workbench.weeks.map((week) => (
                      <Link
                        className={`planner-week-tab ${week.week === workbench.selectedWeek.week ? "is-active" : ""}`}
                        href={`/dashboard?week=${week.week}&day=${getFirstDayIndexForWeek(plan.days, week.week)}`}
                        key={week.week}
                      >
                        第 {week.week} 周
                      </Link>
                    ))}
                  </div>
                  <div className="planner-day-grid">
                    {workbench.days.map((day) => (
                      <Link
                        className={`planner-day-card ${cardStateClass(day.state)}`}
                        href={`/dashboard?week=${day.week}&day=${day.dayIndex}`}
                        key={day.dayIndex}
                      >
                        <div className="planner-day-top">
                          <span className="planner-day-label">{day.shortLabel}</span>
                          <span className="state-tag">{stateLabel(day.state)}</span>
                        </div>
                        <strong className="planner-day-focus">{day.focus}</strong>
                        <span className="planner-day-label">{day.workoutCount} 个安排</span>
                      </Link>
                    ))}
                  </div>
                </section>

                {selectedDay ? (
                  <section className="planner-detail-grid">
                    <article className="surface stack-md">
                      <div className="surface-header">
                        <div className="section-heading">
                          <span className="status-pill">{selectedDay.label}</span>
                          <h2>{selectedDay.focus}</h2>
                          <p>{selectedDay.latestRevisionMessage ?? "先按今天的标准计划执行；如果做不到，可以在右侧直接调整。"}</p>
                        </div>
                        <div className="pill-row">
                          <span className="info-pill">{selectedDay.completed ? "已完成" : "待执行"}</span>
                          <span className="info-pill">{selectedDay.shortLabel}</span>
                        </div>
                      </div>

                      <div className="list-stack">
                        {selectedDay.workoutItems.map((item) => (
                          <div className="list-row" key={item.id}>
                            <div>
                              <strong>
                                <Link
                                  className="text-link"
                                  href={buildExerciseHref(item.exerciseId, {
                                    week: workbench.selectedWeek.week,
                                    day: selectedDay.dayIndex,
                                  })}
                                >
                                  {item.name}
                                </Link>
                              </strong>
                              <p>{formatWorkoutDescription(item)}</p>
                            </div>
                            <span className="list-meta">{formatWorkoutMeta(item)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="planner-inline-actions">
                        <Link
                          className="button-tertiary"
                          href={buildExerciseHref(
                            selectedDay.workoutItems[0]?.exerciseId ?? "bodyweight-squat",
                            {
                              week: workbench.selectedWeek.week,
                              day: selectedDay.dayIndex,
                            },
                          )}
                        >
                          查看动作演示
                        </Link>
                        <Link className="button-secondary" href="/dashboard/profile">
                          编辑资料
                        </Link>
                      </div>
                    </article>

                    <div className="stack-md">
                      <article className="surface stack-md">
                        <div className="section-heading">
                          <h2>今日饮食</h2>
                          <p>热量和蛋白目标会跟着你的目标、体重和恢复状态走。</p>
                        </div>

                        <div className="stats-grid">
                          <div className="planner-detail-card">
                            <span className="planner-day-label">热量</span>
                            <strong>{selectedDay.nutrition.calorieTarget} kcal</strong>
                          </div>
                          <div className="planner-detail-card">
                            <span className="planner-day-label">蛋白质</span>
                            <strong>{selectedDay.nutrition.proteinGrams} g</strong>
                          </div>
                          <div className="planner-detail-card">
                            <span className="planner-day-label">饮水</span>
                            <strong>{selectedDay.nutrition.waterLiters} L</strong>
                          </div>
                          <div className="planner-detail-card">
                            <span className="planner-day-label">限制提示</span>
                            <strong>{selectedDay.nutrition.restrictionNotes[0] ?? "无"}</strong>
                          </div>
                        </div>

                        <div className="section-heading compact-heading">
                          <h3>三餐建议</h3>
                        </div>
                        <ol className="number-list">
                          {selectedDay.nutrition.meals.map((meal) => (
                            <li key={meal}>{meal}</li>
                          ))}
                        </ol>

                        <div className="section-heading compact-heading">
                          <h3>可替换方案</h3>
                        </div>
                        <ul className="bullet-list">
                          {selectedDay.nutrition.swaps.map((swap) => (
                            <li key={swap}>{swap}</li>
                          ))}
                        </ul>
                      </article>

                      <article className="surface stack-md">
                        <div className="section-heading">
                          <h2>打卡</h2>
                          <p>{selectedDay.checkInPrompt}</p>
                        </div>
                        <form action={checkInAction} className="form-stack">
                          <input name="planId" type="hidden" value={plan.id} />
                          <input name="week" type="hidden" value={String(workbench.selectedWeek.week)} />
                          <input name="day" type="hidden" value={String(selectedDay.dayIndex)} />
                          <input name="dayIndex" type="hidden" value={String(selectedDay.dayIndex)} />

                          <div className="choice-grid">
                            <label className="choice-chip">
                              <input defaultChecked name="completed" type="radio" value="yes" />
                              <span>按计划完成</span>
                            </label>
                            <label className="choice-chip">
                              <input name="completed" type="radio" value="no" />
                              <span>没有完全完成</span>
                            </label>
                          </div>

                          <div className="form-grid">
                            <div className="field">
                              <label htmlFor="weightKg">今日体重（kg）</label>
                              <input id="weightKg" name="weightKg" placeholder="可选" step="0.1" type="number" />
                            </div>
                            <div className="field">
                              <label htmlFor="fatigue">疲劳（1-5）</label>
                              <input defaultValue="3" id="fatigue" max="5" min="1" name="fatigue" type="range" />
                            </div>
                            <div className="field">
                              <label htmlFor="pain">疼痛（0-5）</label>
                              <input defaultValue="1" id="pain" max="5" min="0" name="pain" type="range" />
                            </div>
                            <div className="field">
                              <label htmlFor="hunger">饥饿感（1-5）</label>
                              <input defaultValue="3" id="hunger" max="5" min="1" name="hunger" type="range" />
                            </div>
                          </div>

                          <div className="field">
                            <label htmlFor="notes">补充说明</label>
                            <textarea
                              id="notes"
                              name="notes"
                              placeholder="比如：今天只完成了前两个动作，或者某个动作不舒服。"
                              rows={4}
                            />
                          </div>

                          <button className="button-primary" type="submit">
                            保存今天的打卡
                          </button>
                        </form>
                      </article>

                      <article className="surface stack-md">
                        <div className="section-heading">
                          <h2>调整计划</h2>
                          <p>如果做不到、不舒服、时间不够或者饮食执行不了，直接说出来。</p>
                        </div>

                        {selectedDay.latestRevision ? (
                          <div className="stack-md">
                            <div className="section-heading compact-heading">
                              <h3>本日最新调整</h3>
                            </div>
                            <div className="planner-detail-card">
                              <span className="planner-day-label">{selectedDay.latestRevision.adjustmentType}</span>
                              <strong>{selectedDay.latestRevision.message}</strong>
                            </div>
                            {selectedDay.latestRevision.replacements.length > 0 ? (
                              <>
                                <div className="section-heading compact-heading">
                                  <h3>已替换动作</h3>
                                </div>
                                <div className="pill-row">
                                  {selectedDay.latestRevision.replacements.map((item) => (
                                    <span className="info-pill" key={item.id}>
                                      {item.name}
                                    </span>
                                  ))}
                                </div>
                              </>
                            ) : null}
                            {selectedDay.latestRevision.nutritionSuggestions.length > 0 ? (
                              <>
                                <div className="section-heading compact-heading">
                                  <h3>额外饮食建议</h3>
                                </div>
                                <ul className="bullet-list">
                                  {selectedDay.latestRevision.nutritionSuggestions.map((item) => (
                                    <li key={item}>{item}</li>
                                  ))}
                                </ul>
                              </>
                            ) : null}
                          </div>
                        ) : null}

                        <div className="pill-row">
                          {adjustmentSuggestions.map((suggestion) => (
                            <span className="info-pill" key={suggestion}>
                              {suggestion}
                            </span>
                          ))}
                        </div>

                        <form action={adjustmentAction} className="form-stack">
                          <input name="planId" type="hidden" value={plan.id} />
                          <input name="week" type="hidden" value={String(workbench.selectedWeek.week)} />
                          <input name="day" type="hidden" value={String(selectedDay.dayIndex)} />
                          <input name="dayIndex" type="hidden" value={String(selectedDay.dayIndex)} />
                          <div className="field">
                            <label htmlFor="message">你遇到了什么问题？</label>
                            <textarea
                              id="message"
                              name="message"
                              placeholder="比如：今天深蹲膝盖疼，换成更稳一点的动作。"
                              required
                              rows={4}
                            />
                          </div>
                          <button className="button-primary" type="submit">
                            发送调整请求
                          </button>
                        </form>
                      </article>

                      {plan.faqEntries?.length ? (
                        <article className="surface stack-md">
                          <div className="section-heading">
                            <h2>常见问题</h2>
                            <p>这些说明会跟着你的计划类型一起变化，帮助你理解为什么这样安排。</p>
                          </div>
                          <div className="list-stack">
                            {plan.faqEntries.map((entry) => (
                              <div className="list-row" key={entry.id}>
                                <div>
                                  <strong>{entry.question}</strong>
                                  <p>{entry.answer}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </article>
                      ) : null}
                    </div>
                  </section>
                ) : null}
              </div>
            </section>
          </section>
        )}
      </div>
    </main>
  );
}

function getFirstDayIndexForWeek(days: PlanDay[], week: number) {
  return days.find((day) => day.week === week)?.dayIndex ?? 1;
}

function clampNumber(value: string, fallback: number, max: number) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(1, parsed));
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

function cardStateClass(state: "completed" | "current" | "upcoming" | "recovery") {
  if (state === "completed") {
    return "is-complete";
  }
  if (state === "current") {
    return "is-active";
  }
  if (state === "recovery") {
    return "is-recovery";
  }
  return "";
}

function stateLabel(state: "completed" | "current" | "upcoming" | "recovery") {
  if (state === "completed") {
    return "已完成";
  }
  if (state === "current") {
    return "当前";
  }
  if (state === "recovery") {
    return "恢复";
  }
  return "待执行";
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

function experienceLabel(value: AssessmentInput["experience"]) {
  return value === "intermediate" ? "已有基础" : "新手起步";
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

function readDashboardNotice(welcome: string, noticeCode: string) {
  if (noticeCode === "check-in-saved") {
    return "今天的打卡已经保存，工作台会继续参考这次反馈来安排后面的节奏。";
  }

  if (noticeCode === "adjustment-saved") {
    return "调整请求已经保存，新的建议和修订记录就在当前工作台里继续查看。";
  }

  if (welcome === "plan-ready") {
    return "你的建档信息已经保存，下面这份计划来自刚刚提交的真实数据。";
  }

  if (welcome === "back") {
    return "欢迎回来，继续看你这周的计划。";
  }

  return "";
}
