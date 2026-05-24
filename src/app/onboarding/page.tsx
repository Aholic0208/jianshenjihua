import Link from "next/link";
import { redirect } from "next/navigation";

import {
  buildOnboardingSteps,
  createInitialOnboardingAnswers,
  getOnboardingStepOrder,
  type OnboardingAnswers,
  type OnboardingStepId,
} from "@/lib/onboarding-view";
import { getFitnessService, getSessionUser } from "@/lib/server-app";

import { saveOnboardingAction } from "./actions";

type SearchParamsInput = Promise<Record<string, string | string[] | undefined>>;

type OnboardingPageProps = {
  searchParams?: SearchParamsInput;
};

const trainingDayOptions = ["2", "3", "4", "5"];
const sessionMinuteOptions = ["30", "45", "60", "75"];
const carryFieldNames: Array<keyof OnboardingAnswers> = [
  "age",
  "sex",
  "heightCm",
  "weightKg",
  "targetWeightKg",
  "goalText",
  "trainingDays",
  "sessionMinutes",
  "trainingEnvironment",
  "experience",
  "equipment",
  "injuries",
  "chronicConditions",
  "dietaryRestrictions",
  "allergies",
  "sleepHours",
  "foodBudget",
  "currentImageUrl",
  "targetImageUrl",
];

const stepFields: Record<OnboardingStepId, Array<keyof OnboardingAnswers>> = {
  basics: ["age", "sex", "heightCm", "weightKg", "targetWeightKg"],
  goals: ["goalText", "trainingDays", "sessionMinutes"],
  equipment: ["trainingEnvironment", "experience", "equipment"],
  limits: [
    "injuries",
    "chronicConditions",
    "dietaryRestrictions",
    "allergies",
    "sleepHours",
    "foodBudget",
    "currentImageUrl",
    "targetImageUrl",
  ],
  confirm: [],
};

const safetyNotes = [
  "18 岁以下、急性疼痛、孕期、严重慢性病或极端减重目标，会触发保守限制。",
  "参考图只用于帮助理解训练目标，不做医疗诊断或外貌评价。",
  "第一版计划优先追求可执行和安全，不会给出极端训练或极端饮食方案。",
];

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth");
  }

  const params = (await searchParams) ?? {};
  const service = getFitnessService();
  const dashboardData = service.fetchLatestDashboardData(user.id);
  const answers = createInitialOnboardingAnswers({
    displayName: user.name,
    email: user.email,
    assessment: dashboardData.assessment,
    query: params,
  });
  const welcome = readValue(params.welcome);
  const notice = welcome === "1" ? "账号已建立。先把你的训练边界和日常节奏说清楚，我们再生成计划。" : "";
  const wizard = buildOnboardingSteps({
    requestedStep: readValue(params.step),
    answers,
  });
  const currentStep = wizard.currentStep;
  const stepOrder = getOnboardingStepOrder();
  const currentIndex = stepOrder.indexOf(currentStep);
  const previousStep = currentIndex > 0 ? stepOrder[currentIndex - 1] : null;
  const nextStep = currentIndex < stepOrder.length - 1 ? stepOrder[currentIndex + 1] : null;
  const currentStepView = wizard.steps[currentIndex];

  return (
    <main className="screen">
      <div className="page-frame">
        <header className="topbar">
          <Link className="brand-mark" href="/">
            体能计划
          </Link>
          <nav className="topbar-nav" aria-label="建档导航">
            <Link href="/auth">返回账号页</Link>
            <Link href="/dashboard">查看仪表盘</Link>
          </nav>
        </header>

        <section className="stack-lg">
          <div className="surface">
            <div className="section-heading">
              <span className="status-pill">建档向导</span>
              <h1 className="page-title">先把你的训练边界说清楚，再生成一份真正能执行的计划。</h1>
              <p className="lead-text">
                这不是一张一次性长表单，而是一段连续引导。每一步只回答当前最关键的问题，最后再统一确认。
              </p>
            </div>

            <div className="action-row" aria-label="建档步骤">
              {wizard.steps.map((step, index) => (
                <span
                  className={step.state === "current" ? "status-pill" : step.state === "complete" ? "subtle-pill" : "state-tag"}
                  key={step.id}
                >
                  {index + 1}. {step.label}
                </span>
              ))}
            </div>
          </div>

          {notice ? (
            <section className="surface notice-banner is-success">
              <strong>开始建档</strong>
              <p>{notice}</p>
            </section>
          ) : null}

          <section className="wizard-shell">
            <div className="stack-lg">
              <section className="surface">
                <div className="section-heading">
                  <span className="status-pill">第 {currentIndex + 1} 步 / 共 5 步</span>
                  <h2>{currentStepView.label}</h2>
                  <p>{currentStepView.description}</p>
                </div>

                <div className="band-grid">
                  {stepIntroCards(currentStep).map((card) => (
                    <article className="info-card" key={card.title}>
                      <strong>{card.title}</strong>
                      <p>{card.copy}</p>
                    </article>
                  ))}
                </div>
              </section>

              {currentStep === "confirm" ? (
                <form action={saveOnboardingAction} className="surface form-stack">
                  {carryFieldNames.map((fieldName) => (
                    <input key={fieldName} name={fieldName} type="hidden" value={answers[fieldName]} />
                  ))}

                  <div className="section-heading">
                    <h2>最后确认一次</h2>
                    <p>确认无误后，系统会把这些信息写入本地档案，并生成你的 4 周专属计划。</p>
                  </div>

                  <div className="metric-strip">
                    <div className="metric-cell">
                      <span>身体数据</span>
                      <strong>{wizard.summary.metrics}</strong>
                    </div>
                    <div className="metric-cell">
                      <span>训练目标</span>
                      <strong>{wizard.summary.goal}</strong>
                    </div>
                    <div className="metric-cell">
                      <span>每周安排</span>
                      <strong>{wizard.summary.schedule}</strong>
                    </div>
                    <div className="metric-cell">
                      <span>风险边界</span>
                      <strong>{wizard.summary.restrictions}</strong>
                    </div>
                  </div>

                  <div className="list-stack">
                    <div className="list-row">
                      <div>
                        <strong>器械条件</strong>
                        <p>{wizard.summary.equipment}</p>
                      </div>
                    </div>
                    <div className="list-row">
                      <div>
                        <strong>参考图</strong>
                        <p>
                          {answers.currentImageUrl || answers.targetImageUrl
                            ? "已填写参考图链接，系统只会把它们当作目标理解辅助。"
                            : "这次先不使用参考图，后续仍可在资料页补充。"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="action-row">
                    {previousStep ? (
                      <Link className="button-secondary" href={buildStepHref(previousStep, answers)}>
                        返回上一步
                      </Link>
                    ) : null}
                    <button className="button-primary" type="submit">
                      保存建档并生成计划
                    </button>
                  </div>
                </form>
              ) : (
                <form action="/onboarding" className="surface form-stack" method="get">
                  <input name="step" type="hidden" value={nextStep ?? currentStep} />
                  {renderCarryInputs(currentStep, answers)}
                  {renderStepFields(currentStep, answers)}

                  <div className="action-row">
                    {previousStep ? (
                      <Link className="button-secondary" href={buildStepHref(previousStep, answers)}>
                        返回上一步
                      </Link>
                    ) : (
                      <Link className="button-secondary" href="/dashboard">
                        先回仪表盘
                      </Link>
                    )}
                    <button className="button-primary" type="submit">
                      {nextStep ? `继续，进入${stepLabel(nextStep)}` : "继续"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <aside className="surface sticky-panel">
              <div className="section-heading">
                <h2>当前档案摘要</h2>
                <p>这里会随着你的输入同步更新，最后确认页展示的就是这份建档结果。</p>
              </div>

              <div className="list-stack">
                <div className="list-row">
                  <div>
                    <strong>{answers.displayName}</strong>
                    <p>{answers.email}</p>
                  </div>
                </div>
                <div className="list-row">
                  <div>
                    <strong>身体数据</strong>
                    <p>{wizard.summary.metrics}</p>
                  </div>
                </div>
                <div className="list-row">
                  <div>
                    <strong>训练目标</strong>
                    <p>{wizard.summary.goal}</p>
                  </div>
                </div>
                <div className="list-row">
                  <div>
                    <strong>节奏与场景</strong>
                    <p>{wizard.summary.schedule}</p>
                  </div>
                </div>
                <div className="list-row">
                  <div>
                    <strong>限制条件</strong>
                    <p>{wizard.summary.restrictions}</p>
                  </div>
                </div>
              </div>

              <div className="section-heading compact-heading">
                <h3>安全边界</h3>
                <p>我们先保证合理，再追求训练强度和减脂速度。</p>
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

              <div className="section-heading compact-heading">
                <h3>最近计划状态</h3>
              </div>
              <div className="list-stack">
                <div className="list-row">
                  <div>
                    <strong>{dashboardData.plan ? "已存在历史计划" : "尚未生成计划"}</strong>
                    <p>
                      {dashboardData.plan
                        ? dashboardData.plan.status === "restricted"
                          ? "上一次计划处于保守限制状态，本次建档会重新评估。"
                          : "上一次已有可执行计划，这次会覆盖为新的建档版本。"
                        : "完成最后一步确认后，这里会切换成你的最新计划状态。"}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </section>
        </section>
      </div>
    </main>
  );
}

function renderStepFields(step: OnboardingStepId, answers: OnboardingAnswers) {
  if (step === "basics") {
    return (
      <>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="age">年龄</label>
            <input defaultValue={answers.age} id="age" min="18" name="age" required type="number" />
          </div>
          <div className="field">
            <label htmlFor="heightCm">身高（cm）</label>
            <input defaultValue={answers.heightCm} id="heightCm" name="heightCm" required type="number" />
          </div>
          <div className="field">
            <label htmlFor="weightKg">当前体重（kg）</label>
            <input defaultValue={answers.weightKg} id="weightKg" name="weightKg" required step="0.1" type="number" />
          </div>
          <div className="field">
            <label htmlFor="targetWeightKg">目标体重（kg）</label>
            <input
              defaultValue={answers.targetWeightKg}
              id="targetWeightKg"
              name="targetWeightKg"
              placeholder="可选"
              step="0.1"
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
                <input defaultChecked={answers.sex === option.value} name="sex" type="radio" value={option.value} />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </>
    );
  }

  if (step === "goals") {
    return (
      <>
        <div className="field">
          <label htmlFor="goalText">你的目标是什么？</label>
          <textarea
            defaultValue={answers.goalText}
            id="goalText"
            name="goalText"
            placeholder="例如：希望在不影响工作节奏的情况下稳步减脂，并改善久坐后的肩颈僵硬。"
            required
            rows={5}
          />
          <span className="field-hint">写得越像真实生活场景，生成的计划越能落地。</span>
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="trainingDays">每周能练几天？</label>
            <select defaultValue={answers.trainingDays} id="trainingDays" name="trainingDays">
              {trainingDayOptions.map((value) => (
                <option key={value} value={value}>
                  {value} 天
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="sessionMinutes">每次大概能练多久？</label>
            <select defaultValue={answers.sessionMinutes} id="sessionMinutes" name="sessionMinutes">
              {sessionMinuteOptions.map((value) => (
                <option key={value} value={value}>
                  {value} 分钟
                </option>
              ))}
            </select>
          </div>
        </div>
      </>
    );
  }

  if (step === "equipment") {
    return (
      <>
        <fieldset className="choice-group">
          <legend>你主要在哪里训练？</legend>
          <div className="choice-grid">
            {[
              { value: "home", label: "居家" },
              { value: "gym", label: "健身房" },
              { value: "both", label: "两者都可以" },
            ].map((option) => (
              <label className="choice-chip" key={option.value}>
                <input
                  defaultChecked={answers.trainingEnvironment === option.value}
                  name="trainingEnvironment"
                  type="radio"
                  value={option.value}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="choice-group">
          <legend>你目前的训练经验</legend>
          <div className="choice-grid">
            {[
              { value: "beginner", label: "新手" },
              { value: "intermediate", label: "有基础" },
            ].map((option) => (
              <label className="choice-chip" key={option.value}>
                <input
                  defaultChecked={answers.experience === option.value}
                  name="experience"
                  type="radio"
                  value={option.value}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <label htmlFor="equipment">你现在能用到哪些器械？</label>
          <textarea
            defaultValue={answers.equipment}
            id="equipment"
            name="equipment"
            placeholder="例如：瑜伽垫、弹力带、5kg 哑铃；如果没有，也可以直接写“徒手”。"
            required
            rows={5}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="injuries">伤病或疼痛史</label>
          <textarea
            defaultValue={answers.injuries}
            id="injuries"
            name="injuries"
            placeholder="没有就写“无”；如果有，请写清部位、触发情况和近期状态。"
            required
            rows={4}
          />
        </div>
        <div className="field">
          <label htmlFor="chronicConditions">慢性病或特殊情况</label>
          <textarea
            defaultValue={answers.chronicConditions}
            id="chronicConditions"
            name="chronicConditions"
            placeholder="例如：高血压、术后恢复、孕期；没有就写“无”。"
            required
            rows={4}
          />
        </div>
        <div className="field">
          <label htmlFor="dietaryRestrictions">饮食限制</label>
          <textarea
            defaultValue={answers.dietaryRestrictions}
            id="dietaryRestrictions"
            name="dietaryRestrictions"
            placeholder="例如：不吃牛肉、乳糖不耐受；没有就写“无”。"
            required
            rows={4}
          />
        </div>
        <div className="field">
          <label htmlFor="allergies">过敏信息</label>
          <textarea
            defaultValue={answers.allergies}
            id="allergies"
            name="allergies"
            placeholder="例如：花生过敏；没有就写“无”。"
            required
            rows={4}
          />
        </div>
      </div>

      <div className="form-grid">
        <div className="field">
          <label htmlFor="sleepHours">平均睡眠（小时）</label>
          <input defaultValue={answers.sleepHours} id="sleepHours" name="sleepHours" placeholder="可选" step="0.5" type="number" />
        </div>
        <div className="field">
          <label htmlFor="currentImageUrl">当前状态参考图（可选链接）</label>
          <input
            defaultValue={answers.currentImageUrl}
            id="currentImageUrl"
            name="currentImageUrl"
            placeholder="https://..."
            type="url"
          />
        </div>
        <div className="field">
          <label htmlFor="targetImageUrl">目标参考图（可选链接）</label>
          <input
            defaultValue={answers.targetImageUrl}
            id="targetImageUrl"
            name="targetImageUrl"
            placeholder="https://..."
            type="url"
          />
        </div>
      </div>

      <fieldset className="choice-group">
        <legend>你的饮食预算</legend>
        <div className="choice-grid">
          {[
            { value: "low", label: "预算紧" },
            { value: "normal", label: "正常" },
            { value: "high", label: "预算宽松" },
          ].map((option) => (
            <label className="choice-chip" key={option.value}>
              <input defaultChecked={answers.foodBudget === option.value} name="foodBudget" type="radio" value={option.value} />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </>
  );
}

function renderCarryInputs(currentStep: OnboardingStepId, answers: OnboardingAnswers) {
  const editableFields = new Set(stepFields[currentStep]);
  return carryFieldNames
    .filter((fieldName) => !editableFields.has(fieldName))
    .map((fieldName) => <input key={fieldName} name={fieldName} type="hidden" value={answers[fieldName]} />);
}

function buildStepHref(step: OnboardingStepId, answers: OnboardingAnswers) {
  const params = new URLSearchParams();
  params.set("step", step);

  for (const fieldName of carryFieldNames) {
    params.set(fieldName, answers[fieldName]);
  }

  return `/onboarding?${params.toString()}`;
}

function stepLabel(step: OnboardingStepId) {
  if (step === "basics") {
    return "基础信息";
  }
  if (step === "goals") {
    return "目标与节奏";
  }
  if (step === "equipment") {
    return "场景与器械";
  }
  if (step === "limits") {
    return "限制条件";
  }
  return "确认生成";
}

function stepIntroCards(step: OnboardingStepId) {
  if (step === "basics") {
    return [
      { title: "只问关键数据", copy: "先用年龄、身高、体重和目标体重框住计划强度。" },
      { title: "默认值可直接改", copy: "如果你之前填过资料，这里会自动带出，改掉不准的地方即可。" },
      { title: "目标体重可留空", copy: "如果你更在意体态和体能，也可以先只写大方向。" },
    ];
  }

  if (step === "goals") {
    return [
      { title: "先说真实目标", copy: "写出你真正想解决的问题，而不是只写“减肥”两个字。" },
      { title: "按生活节奏来", copy: "每周频率和单次时长越真实，计划越不容易半途放弃。" },
      { title: "先稳定，再进阶", copy: "第一版会优先保证安全和持续性。" },
    ];
  }

  if (step === "equipment") {
    return [
      { title: "训练场景影响动作库", copy: "居家、健身房、两者都可，会直接决定系统给你的动作选择。" },
      { title: "器械越清楚越好", copy: "别怕写得具体，哪怕只有一根弹力带也会影响计划生成。" },
      { title: "经验决定节奏", copy: "新手会收到更保守、更解释型的安排。" },
    ];
  }

  if (step === "limits") {
    return [
      { title: "这一步很重要", copy: "请把疼痛、慢性病、饮食限制说清楚，不要为了快而省略。" },
      { title: "没有也请明确写无", copy: "这样系统能区分“真的没有”和“还没填到”。" },
      { title: "参考图只是辅助", copy: "目标图和现状图只帮助系统理解方向，不代表结果承诺。" },
    ];
  }

  return [
    { title: "马上生成计划", copy: "确认后会写入本地档案，并生成你的 4 周训练与饮食安排。" },
    { title: "后面还能调整", copy: "计划不是锁死的。打卡、反馈和器械变化都可以继续修正。" },
    { title: "先求靠谱", copy: "第一版计划以合理、安全、能执行为第一目标。" },
  ];
}

function readValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}
