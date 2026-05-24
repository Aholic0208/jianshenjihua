import { createPreviewDashboard } from "@/lib/preview";

const dashboard = createPreviewDashboard();

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero-band">
        <div className="content-wrap hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Fitness Plan Preview</p>
            <h1>让训练计划像私人教练一样，先懂你，再安排你。</h1>
            <p className="hero-text">
              用户填写身体数据、目标、训练场景和饮食限制之后，系统给出可执行的四周计划，并且保留随时追问、替换动作和调整饮食的入口。
            </p>
            <div className="hero-actions">
              <a className="primary-action" href="#today-plan">
                查看今日计划
              </a>
              <a className="secondary-action" href="#exercise-demo">
                看动作演示
              </a>
            </div>
          </div>

          <div className="hero-summary">
            <div className="summary-topline">
              <span>Preview User</span>
              <strong>{dashboard.user.name}</strong>
            </div>
            <div className="metric-grid">
              <div className="metric-card">
                <span>身体数据</span>
                <strong>
                  {dashboard.user.heightCm}cm / {dashboard.user.weightKg}kg
                </strong>
              </div>
              <div className="metric-card">
                <span>训练场景</span>
                <strong>{dashboard.user.environment}</strong>
              </div>
              <div className="metric-card metric-card-wide">
                <span>当前目标</span>
                <strong>{dashboard.user.goal}</strong>
              </div>
            </div>
            <div className="safety-strip">
              <h2>{dashboard.safety.title}</h2>
              <p>{dashboard.safety.description}</p>
              <ul>
                {dashboard.safety.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="content-wrap section-grid">
          <div>
            <div className="section-intro">
              <p className="eyebrow">Onboarding</p>
              <h2>{dashboard.onboarding.title}</h2>
              <p>第一屏不是冷冰冰的表单，而是一套逐步建档流程，帮助用户说清楚目标、限制和现实条件。</p>
            </div>
            <div className="field-list">
              {dashboard.onboarding.fields.map((field) => (
                <div className="field-row" key={field.label}>
                  <span>{field.label}</span>
                  <strong>{field.value}</strong>
                </div>
              ))}
            </div>
            <div className="body-image-grid">
              {dashboard.onboarding.bodyImages.map((image) => (
                <figure className="body-image-card" key={image.label}>
                  <img alt={image.label} src={image.imageUrl} />
                  <figcaption>{image.label}</figcaption>
                </figure>
              ))}
            </div>
          </div>

          <div className="followup-panel">
            <p className="eyebrow">AI Follow-up</p>
            <h3>生成计划前的追问</h3>
            <ul className="plain-list">
              {dashboard.onboarding.followUpQuestions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="band accent-band">
        <div className="content-wrap">
          <div className="section-intro">
            <p className="eyebrow">4-Week Plan</p>
            <h2>四周计划不是一次性给完，而是按周推进、按反馈修正。</h2>
          </div>
          <div className="week-grid">
            {dashboard.weekCards.map((weekCard) => (
              <article className="week-card" key={weekCard.week}>
                <span className="week-pill">Week {weekCard.week}</span>
                <h3>{weekCard.title}</h3>
                <p>{weekCard.goal}</p>
                <strong>{weekCard.completionLabel}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="today-plan">
        <div className="content-wrap two-column">
          <div>
            <div className="section-intro">
              <p className="eyebrow">Today</p>
              <h2>{dashboard.today.label}</h2>
              <p>{dashboard.today.focus}</p>
            </div>

            <div className="workout-list">
              {dashboard.today.workoutItems.map((item) => (
                <article className="workout-card" key={item.id}>
                  <div className="workout-card-top">
                    <span className="category-tag">{categoryLabel(item.category)}</span>
                    <a href="#exercise-demo">查看演示</a>
                  </div>
                  <h3>{item.name}</h3>
                  <p>{item.notes}</p>
                  <div className="workout-meta">
                    {item.sets ? <span>{item.sets} 组</span> : null}
                    {item.reps ? <span>{item.reps}</span> : null}
                    {item.durationMinutes ? <span>{item.durationMinutes} 分钟</span> : null}
                    <span>强度 {intensityLabel(item.intensity)}</span>
                  </div>
                </article>
              ))}
            </div>
            <p className="checkin-text">{dashboard.today.checkInPrompt}</p>
          </div>

          <div className="nutrition-panel">
            <p className="eyebrow">Nutrition</p>
            <h3>今天怎么吃</h3>
            <p>{dashboard.nutrition.summary}</p>
            <ul className="plain-list">
              {dashboard.nutrition.meals.map((meal) => (
                <li key={meal}>{meal}</li>
              ))}
            </ul>
            <div className="swap-block">
              <h4>可替换食物</h4>
              <ul className="plain-list compact">
                {dashboard.nutrition.swaps.map((swap) => (
                  <li key={swap}>{swap}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="band media-band" id="exercise-demo">
        <div className="content-wrap media-grid">
          <div className="exercise-poster">
            <img alt={dashboard.exerciseSpotlight.title} src={dashboard.exerciseSpotlight.imageUrl} />
          </div>

          <div className="exercise-panel">
            <p className="eyebrow">Exercise Detail</p>
            <h2>{dashboard.exerciseSpotlight.title}</h2>
            <a className="video-link" href={dashboard.exerciseSpotlight.videoUrl} target="_blank" rel="noreferrer">
              {dashboard.exerciseSpotlight.videoLabel}
            </a>

            <div className="detail-columns">
              <div>
                <h3>动作要点</h3>
                <ul className="plain-list compact">
                  {dashboard.exerciseSpotlight.cues.map((cue) => (
                    <li key={cue}>{cue}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>常见错误</h3>
                <ul className="plain-list compact">
                  {dashboard.exerciseSpotlight.mistakes.map((mistake) => (
                    <li key={mistake}>{mistake}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="alternatives">
              <h3>替代动作</h3>
              <div className="pill-row">
                {dashboard.exerciseSpotlight.alternatives.map((item) => (
                  <span className="soft-pill" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="content-wrap section-grid">
          <div>
            <div className="section-intro">
              <p className="eyebrow">AI Adjustment</p>
              <h2>用户说“做不到”的时候，系统不是报错，而是改计划。</h2>
            </div>
            <div className="chat-list">
              {dashboard.adjustments.map((item) => (
                <article className="chat-item" key={item.prompt}>
                  <span className="chat-tag">{adjustmentLabel(item.tag)}</span>
                  <p className="chat-prompt">{item.prompt}</p>
                  <p className="chat-response">{item.response}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="action-panel">
            <p className="eyebrow">Quick Actions</p>
            <h3>计划内的即时入口</h3>
            <div className="action-list">
              {dashboard.quickActions.map((action) => (
                <article className="action-card" key={action.title}>
                  <h4>{action.title}</h4>
                  <p>{action.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function categoryLabel(category: string) {
  if (category === "warmup") {
    return "热身";
  }
  if (category === "strength") {
    return "力量";
  }
  if (category === "cardio") {
    return "有氧";
  }
  return "拉伸";
}

function intensityLabel(intensity: string) {
  if (intensity === "easy") {
    return "轻";
  }
  if (intensity === "moderate") {
    return "中";
  }
  return "高";
}

function adjustmentLabel(tag: string) {
  if (tag === "exercise_swap") {
    return "动作替换";
  }
  if (tag === "nutrition_swap") {
    return "饮食替换";
  }
  if (tag === "load_adjustment") {
    return "训练降载";
  }
  if (tag === "safety_referral") {
    return "安全提醒";
  }
  return "一般建议";
}
