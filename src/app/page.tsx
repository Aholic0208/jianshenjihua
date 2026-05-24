import Link from "next/link";

import { getSessionUser } from "@/lib/server-app";

const entrySteps = [
  {
    title: "1. 进入体验",
    description: "从落地入口进入本地登录或注册，明确你是首次创建计划还是回访查看。",
  },
  {
    title: "2. 完成评估",
    description: "填写训练频次、目标、身体基础数据和训练条件，先把计划边界说清楚。",
  },
  {
    title: "3. 进入首页",
    description: "根据当前输入生成今日训练、周安排、饮食提醒和下一步动作入口。",
  },
];

const operatingPoints = [
  "流程先走通，数据用本地 seed 承接。",
  "页面结构按真实产品边界拆开，后续可接账号与计划服务。",
  "文案、层级和状态先按 MVP 使用场景收口，不再停留在预览稿。",
];

const previewItems = [
  { label: "训练目标", value: "减脂塑形 + 核心稳定" },
  { label: "每周频次", value: "4 次 / 45 分钟" },
  { label: "训练场景", value: "居家与健身房混合" },
  { label: "饮食关注", value: "高蛋白、工作日易执行" },
];

const schedulePreview = [
  { day: "周一", title: "下肢力量", state: "已排入" },
  { day: "周二", title: "恢复与拉伸", state: "轻量" },
  { day: "周三", title: "上肢推拉", state: "已排入" },
  { day: "周四", title: "步行与睡眠", state: "恢复" },
  { day: "周五", title: "全身代谢", state: "已排入" },
];

export default async function LandingPage() {
  const sessionUser = await getSessionUser();

  return (
    <main className="screen">
      <div className="page-frame">
        <header className="topbar">
          <Link className="brand-mark" href="/">
            体能计划
          </Link>
          <nav className="topbar-nav" aria-label="主导航">
            <Link href="/auth">登录 / 注册</Link>
            <Link href="/onboarding">评估问卷</Link>
            <Link href="/dashboard">仪表盘</Link>
          </nav>
        </header>

        <section className="landing-grid">
          <div className="stack-lg">
            <div className="stack-md">
              <span className="status-pill">MVP 本地模式</span>
              <h1 className="page-title">先完成评估，再进入真正可执行的训练首页。</h1>
              <p className="lead-text">
                这一版已经把入口、账号、本地问卷、SQLite 存储和仪表盘主流程接起来了。先建档，再生成计划，后面就能持续查看训练、饮食、打卡和调整记录。
              </p>
            </div>

            <div className="action-row">
              <Link className="button-primary" href={sessionUser ? "/dashboard" : "/auth"}>
                {sessionUser ? "继续我的计划" : "开始创建计划"}
              </Link>
              <Link className="button-secondary" href={sessionUser ? "/onboarding" : "/auth"}>
                {sessionUser ? "更新评估信息" : "先登录本地账号"}
              </Link>
            </div>

            <div className="surface">
              <div className="section-heading">
                <h2>这次交付包含什么</h2>
                <p>不是一张效果图，而是一条完整的本地体验路径。</p>
              </div>
              <div className="list-stack">
                {entrySteps.map((step) => (
                  <div className="list-row" key={step.title}>
                    <div>
                      <strong>{step.title}</strong>
                      <p>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="surface preview-panel">
            <div className="section-heading">
              <h2>流程预览</h2>
              <p>页面先用演示数据驱动，但结构已经按真实产品壳组织。</p>
            </div>

            <div className="metric-strip">
              {previewItems.map((item) => (
                <div className="metric-cell" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>

            <div className="section-heading compact-heading">
              <h3>本周安排示意</h3>
              <p>首页会把计划浓缩成能直接开始执行的工作面板。</p>
            </div>

            <div className="list-stack">
              {schedulePreview.map((item) => (
                <div className="list-row" key={item.day}>
                  <div>
                    <strong>
                      {item.day} · {item.title}
                    </strong>
                    <p>{item.state}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="info-band">
          <div className="band-grid">
            {operatingPoints.map((point) => (
              <article className="info-card" key={point}>
                <span className="mini-label">交付要点</span>
                <p>{point}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
