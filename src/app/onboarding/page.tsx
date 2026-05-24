import Link from "next/link";
import { redirect } from "next/navigation";

import { getFitnessService, getSessionUser } from "@/lib/server-app";
import type { AssessmentInput } from "@/lib/types";

import { saveOnboardingAction } from "./actions";

type SearchParamsInput = Promise<Record<string, string | string[] | undefined>>;

type OnboardingPageProps = {
  searchParams?: SearchParamsInput;
};

const trainingDayOptions = ["2", "3", "4", "5"];
const sessionMinuteOptions = ["30", "45", "60", "75"];

const safetyNotes = [
  "18 岁以下、急性疼痛、怀孕、严重慢性病或极端减重目标，会触发保守限制。",
  "目标图片与现状图片只用于帮助理解训练目标，不做医疗诊断或外貌评价。",
  "饮食建议优先保证可执行性，不会给出极端节食方案。",
];

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth");
  }

  const params = (await searchParams) ?? {};
  const notice = readValue(params.welcome) === "1" ? "账号已建立，现在把你的训练边界填写完整。" : "";
  const dashboardData = getFitnessService().fetchLatestDashboardData(user.id);
  const assessment = dashboardData.assessment;
  const plan = dashboardData.plan;
  const state = buildDefaultState(user.name, user.email, assessment);

  return (
    <main className="screen">
      <div className="page-frame">
        <header className="topbar">
          <Link className="brand-mark" href="/">
            体能计划
          </Link>
          <nav className="topbar-nav" aria-label="次级导航">
            <Link href="/auth">返回账号页</Link>
            <Link href="/dashboard">查看仪表盘</Link>
          </nav>
        </header>

        <section className="onboarding-grid">
          <div className="stack-lg">
            <div className="stack-md">
              <span className="status-pill">评估问卷</span>
              <h1 className="page-title">把身体情况、训练条件和饮食边界说清楚，计划才会真的能执行。</h1>
              <p className="lead-text">
                这里提交的内容会直接保存到本地档案，并用于生成 4 周训练与饮食计划。后续你在打卡或调整时，系统会基于这些信息给出更合理的建议。
              </p>
            </div>

            {notice ? (
              <section className="surface notice-banner is-success">
                <strong>开始建档</strong>
                <p>{notice}</p>
              </section>
            ) : null}

            <section className="surface">
              <div className="section-heading">
                <h2>评估会影响什么</h2>
                <p>不是为了凑字段，而是为了让训练和饮食建议有边界、有依据。</p>
              </div>
              <div className="three-column-list">
                <div className="summary-cell">
                  <strong>训练频率</strong>
                  <p>决定每周安排多少训练日和恢复日。</p>
                </div>
                <div className="summary-cell">
                  <strong>风险提示</strong>
                  <p>遇到未成年人、急性疼痛或高风险病史时，计划会自动保守。</p>
                </div>
                <div className="summary-cell">
                  <strong>饮食执行</strong>
                  <p>结合忌口、过敏、预算和睡眠，把建议落到每天能做的程度。</p>
                </div>
              </div>
            </section>

            <form action={saveOnboardingAction} className="surface form-stack">
              <div className="section-heading">
                <h2>基础资料</h2>
                <p>这些数据会成为你的档案基线。</p>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label htmlFor="display-name">昵称</label>
                  <input defaultValue={state.displayName} disabled id="display-name" type="text" />
                </div>
                <div className="field">
                  <label htmlFor="email">邮箱</label>
                  <input defaultValue={state.email} disabled id="email" type="email" />
                </div>
                <div className="field">
                  <label htmlFor="age">年龄</label>
                  <input defaultValue={state.age} id="age" name="age" required type="number" />
                </div>
                <div className="field">
                  <label htmlFor="height-cm">身高（cm）</label>
                  <input defaultValue={state.heightCm} id="height-cm" name="heightCm" required type="number" />
                </div>
                <div className="field">
                  <label htmlFor="weight-kg">当前体重（kg）</label>
                  <input defaultValue={state.weightKg} id="weight-kg" name="weightKg" required type="number" />
                </div>
                <div className="field">
                  <label htmlFor="target-weight-kg">目标体重（kg）</label>
                  <input
                    defaultValue={state.targetWeightKg}
                    id="target-weight-kg"
                    name="targetWeightKg"
                    placeholder="可选"
                    type="number"
                  />
                </div>
              </div>

              <fieldset className="choice-group">
                <legend>性别</legend>
                <div className="choice-grid">
                  {[
                    { value: "female", label: "女性" },
                    { value: "male", label: "男性" },
                    { value: "other", label: "其他 / 不说明" },
                  ].map((option) => (
                    <label className="choice-chip" key={option.value}>
                      <input defaultChecked={state.sex === option.value} name="sex" type="radio" value={option.value} />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="section-heading">
                <h2>训练条件</h2>
                <p>先确认你能稳定执行的频次、时长和场景，再谈进阶。</p>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label htmlFor="training-days">每周训练天数</label>
                  <select defaultValue={state.trainingDays} id="training-days" name="trainingDays">
                    {trainingDayOptions.map((value) => (
                      <option key={value} value={value}>
                        {value} 天
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="session-minutes">单次训练时长</label>
                  <select defaultValue={state.sessionMinutes} id="session-minutes" name="sessionMinutes">
                    {sessionMinuteOptions.map((value) => (
                      <option key={value} value={value}>
                        {value} 分钟
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="sleep-hours">平均睡眠（小时）</label>
                  <input defaultValue={state.sleepHours} id="sleep-hours" name="sleepHours" placeholder="可选" type="number" />
                </div>
                <div className="field">
                  <label htmlFor="equipment">现有器械</label>
                  <textarea
                    defaultValue={state.equipment}
                    id="equipment"
                    name="equipment"
                    placeholder="例如：瑜伽垫，弹力带，5kg 哑铃"
                    rows={4}
                  />
                </div>
              </div>

              <fieldset className="choice-group">
                <legend>训练经验</legend>
                <div className="choice-grid">
                  {[
                    { value: "beginner", label: "新手" },
                    { value: "intermediate", label: "有基础" },
                  ].map((option) => (
                    <label className="choice-chip" key={option.value}>
                      <input defaultChecked={state.experience === option.value} name="experience" type="radio" value={option.value} />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="choice-group">
                <legend>训练场景</legend>
                <div className="choice-grid">
                  {[
                    { value: "home", label: "居家" },
                    { value: "gym", label: "健身房" },
                    { value: "both", label: "两者都可" },
                  ].map((option) => (
                    <label className="choice-chip" key={option.value}>
                      <input defaultChecked={state.environment === option.value} name="environment" type="radio" value={option.value} />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="section-heading">
                <h2>目标与限制</h2>
                <p>这部分会直接影响计划强度、动作替换和饮食建议。</p>
              </div>

              <div className="field">
                <label htmlFor="goal-text">目标描述</label>
                <textarea
                  defaultValue={state.goalText}
                  id="goal-text"
                  name="goalText"
                  placeholder="例如：希望在不影响工作节奏的情况下稳定减脂，并改善肩颈僵硬。"
                  required
                  rows={4}
                />
              </div>

              <div className="form-grid">
                <div className="field">
                  <label htmlFor="injuries">伤病或疼痛史</label>
                  <textarea
                    defaultValue={state.injuries}
                    id="injuries"
                    name="injuries"
                    placeholder="例如：膝盖偶尔不适、肩部活动受限"
                    rows={4}
                  />
                </div>
                <div className="field">
                  <label htmlFor="chronic-conditions">慢性病 / 特殊情况</label>
                  <textarea
                    defaultValue={state.chronicConditions}
                    id="chronic-conditions"
                    name="chronicConditions"
                    placeholder="例如：高血压、术后恢复、怀孕等"
                    rows={4}
                  />
                </div>
                <div className="field">
                  <label htmlFor="dietary-restrictions">饮食限制</label>
                  <textarea
                    defaultValue={state.dietaryRestrictions}
                    id="dietary-restrictions"
                    name="dietaryRestrictions"
                    placeholder="例如：不吃牛肉、乳糖不耐受"
                    rows={4}
                  />
                </div>
                <div className="field">
                  <label htmlFor="allergies">过敏信息</label>
                  <textarea
                    defaultValue={state.allergies}
                    id="allergies"
                    name="allergies"
                    placeholder="例如：花生过敏、海鲜过敏"
                    rows={4}
                  />
                </div>
              </div>

              <fieldset className="choice-group">
                <legend>饮食预算</legend>
                <div className="choice-grid">
                  {[
                    { value: "low", label: "预算紧" },
                    { value: "normal", label: "正常" },
                    { value: "high", label: "预算宽松" },
                  ].map((option) => (
                    <label className="choice-chip" key={option.value}>
                      <input defaultChecked={state.foodBudget === option.value} name="foodBudget" type="radio" value={option.value} />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="section-heading">
                <h2>目标图片（可选）</h2>
                <p>先用图片链接保存参考，后续可以继续扩展为本地上传。</p>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label htmlFor="current-image-url">当前状态图片链接</label>
                  <input
                    defaultValue={state.currentImageUrl}
                    id="current-image-url"
                    name="currentImageUrl"
                    placeholder="https://..."
                    type="url"
                  />
                </div>
                <div className="field">
                  <label htmlFor="target-image-url">目标参考图片链接</label>
                  <input
                    defaultValue={state.targetImageUrl}
                    id="target-image-url"
                    name="targetImageUrl"
                    placeholder="https://..."
                    type="url"
                  />
                </div>
              </div>

              <div className="action-row">
                <Link className="button-secondary" href="/dashboard">
                  先返回仪表盘
                </Link>
                <button className="button-primary" type="submit">
                  保存评估并生成计划
                </button>
              </div>
            </form>
          </div>

          <aside className="surface sticky-panel">
            <div className="section-heading">
              <h2>档案摘要</h2>
              <p>保存后，这些信息会直接驱动你的训练计划与饮食建议。</p>
            </div>

            <div className="list-stack">
              <div className="list-row">
                <div>
                  <strong>{state.displayName}</strong>
                  <p>
                    {state.age} 岁 · {state.heightCm} cm / {state.weightKg} kg
                  </p>
                </div>
              </div>
              <div className="list-row">
                <div>
                  <strong>当前目标</strong>
                  <p>{state.goalText}</p>
                </div>
              </div>
              <div className="list-row">
                <div>
                  <strong>训练安排</strong>
                  <p>
                    每周 {state.trainingDays} 次，每次 {state.sessionMinutes} 分钟
                  </p>
                </div>
              </div>
              <div className="list-row">
                <div>
                  <strong>已有计划状态</strong>
                  <p>{plan ? (plan.status === "restricted" ? "当前为受限状态" : "已有活动计划") : "尚未生成计划"}</p>
                </div>
              </div>
            </div>

            <div className="section-heading compact-heading">
              <h3>安全边界</h3>
              <p>系统会先保证合理性，再追求强度和速度。</p>
            </div>
            <div className="list-stack">
              {safetyNotes.map((note) => (
                <div className="list-row" key={note}>
                  <div>
                    <strong>{note}</strong>
                  </div>
                </div>
              ))}
            </div>

            {plan?.safety.messages.length ? (
              <div className="section-heading compact-heading">
                <h3>最近一次安全提示</h3>
              </div>
            ) : null}
            <div className="list-stack">
              {plan?.safety.messages.map((message) => (
                <div className="list-row" key={message}>
                  <div>
                    <strong>{message}</strong>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function buildDefaultState(displayName: string, email: string, assessment: AssessmentInput | null) {
  return {
    displayName,
    email,
    age: String(assessment?.age ?? 29),
    sex: assessment?.sex ?? "female",
    heightCm: String(assessment?.heightCm ?? 168),
    weightKg: String(assessment?.weightKg ?? 70),
    targetWeightKg: assessment?.targetWeightKg ? String(assessment.targetWeightKg) : "",
    trainingDays: String(assessment?.trainingDaysPerWeek ?? 4),
    sessionMinutes: String(assessment?.sessionMinutes ?? 45),
    environment: assessment?.trainingEnvironment ?? "both",
    experience: assessment?.experience ?? "beginner",
    goalText: assessment?.goalText ?? "希望先稳定减脂，再逐步改善核心稳定和久坐后的僵硬感。",
    equipment: joinLines(assessment?.equipment),
    injuries: joinLines(assessment?.injuries),
    chronicConditions: joinLines(assessment?.chronicConditions),
    dietaryRestrictions: joinLines(assessment?.dietaryRestrictions),
    allergies: joinLines(assessment?.allergies),
    sleepHours: assessment?.sleepHours ? String(assessment.sleepHours) : "",
    foodBudget: assessment?.foodBudget ?? "normal",
    currentImageUrl: findImageUrl(assessment, "current"),
    targetImageUrl: findImageUrl(assessment, "target"),
  };
}

function joinLines(values: string[] | undefined) {
  return values?.join("\n") ?? "";
}

function findImageUrl(assessment: AssessmentInput | null, kind: "current" | "target") {
  return assessment?.uploadedImages?.find((image) => image.kind === kind)?.url ?? "";
}

function readValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}
