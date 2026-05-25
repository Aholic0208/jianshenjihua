import { existsSync } from "node:fs";
import { join } from "node:path";

import Link from "next/link";
import { notFound } from "next/navigation";

import { buildDashboardHref, resolveDashboardSelection } from "@/lib/dashboard-routing";
import { findExercise } from "@/lib/exercise-library";

interface ExerciseDetailPageProps {
  params: Promise<{ exerciseId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ExerciseDetailPage({ params, searchParams }: ExerciseDetailPageProps) {
  const { exerciseId } = await params;
  const rawSearchParams = (await searchParams) ?? {};
  const exercise = findExercise(exerciseId);

  if (!exercise) {
    notFound();
  }

  const selection = resolveDashboardSelection({
    week: readValue(rawSearchParams.week),
    day: readValue(rawSearchParams.day),
  });
  const properImageUrl = resolveGeneratedImage(exercise.id, "proper") ?? exercise.imageUrl;
  const mistakeImageUrl = resolveGeneratedImage(exercise.id, "mistake") ?? exercise.mistakeImageUrl ?? null;

  return (
    <main className="screen">
      <div className="page-frame">
        <header className="topbar">
          <Link className="brand-mark" href="/">
            健身计划
          </Link>
          <nav className="topbar-nav" aria-label="动作详情导航">
            <Link href={buildDashboardHref(selection)}>返回计划工作台</Link>
            <a href={exercise.videoUrl} rel="noreferrer" target="_blank">
              打开视频演示
            </a>
          </nav>
        </header>

        <section className="stack-lg">
          <section className="surface">
            <div className="surface-header">
              <div className="section-heading">
                <span className="status-pill">动作教学</span>
                <h1 className="panel-title">{exercise.name}</h1>
                <p>
                  这页专门给新手看动作标准、常见错误、注意事项和替代方案。先保证动作干净，再追求组数和强度。
                </p>
              </div>
              <a className="button-primary" href={exercise.videoUrl} rel="noreferrer" target="_blank">
                观看视频演示
              </a>
            </div>

            <div className="pill-row">
              <span className="info-pill">环境：{environmentLabel(exercise.environment)}</span>
              <span className="info-pill">难度：{exercise.difficulty === "intermediate" ? "进阶" : "新手"}</span>
              <span className="info-pill">肌群：{exercise.muscles.join("、")}</span>
              <span className="info-pill">器械：{exercise.equipment.length ? exercise.equipment.join("、") : "无需器械"}</span>
            </div>
          </section>

          <section className="media-grid">
            <article className="teaching-card stack-md">
              <div className="section-heading">
                <h2>标准动作</h2>
                <p>优先看身体线条和重心位置，而不是只看手脚摆放。</p>
              </div>
              <img alt={`${exercise.name} 标准动作示意`} src={properImageUrl} />
            </article>

            <article className="teaching-card stack-md">
              <div className="section-heading">
                <h2>常见错误示意</h2>
                <p>先避开最常见的错误，动作稳定性会提升得很快。</p>
              </div>
              {mistakeImageUrl ? (
                <img alt={`${exercise.name} 常见错误示意`} src={mistakeImageUrl} />
              ) : (
                <div className="surface stack-md">
                  <div className="section-heading compact-heading">
                    <h3>先重点避开这几种错误</h3>
                  </div>
                  <ul className="bullet-list">
                    {exercise.commonMistakes.map((mistake) => (
                      <li key={mistake}>{mistake}</li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          </section>

          <section className="planner-detail-grid">
            <article className="surface stack-md">
              <div className="section-heading">
                <h2>动作要领</h2>
                <p>先把姿势做干净，再慢慢把节奏带起来，不用一开始就追求幅度和速度。</p>
              </div>
              <ol className="number-list">
                {exercise.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </article>

            <article className="surface stack-md">
              <div className="section-heading">
                <h2>发力技巧</h2>
                <p>这些提示能帮你找到正确的主动发力点，避免靠甩腿、耸肩或憋气硬撑。</p>
              </div>
              <ul className="bullet-list">
                {exercise.cues.map((cue) => (
                  <li key={cue}>{cue}</li>
                ))}
              </ul>
            </article>
          </section>

          <section className="planner-detail-grid">
            <article className="surface stack-md">
              <div className="section-heading">
                <h2>新手最容易犯的错误</h2>
                <p>如果你感觉动作“越做越乱”，先回来对照这一栏。</p>
              </div>
              <ul className="bullet-list">
                {exercise.commonMistakes.map((mistake) => (
                  <li key={mistake}>{mistake}</li>
                ))}
              </ul>
            </article>

            <article className="surface stack-md">
              <div className="section-heading">
                <h2>什么时候先不要做</h2>
                <p>出现这些情况时，先停下来处理问题，比硬练更重要。</p>
              </div>
              <ul className="warning-list">
                {exercise.contraindications.map((item) => (
                  <li className="warning-item" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </section>

          <section className="planner-detail-grid">
            <article className="surface stack-md">
              <div className="section-heading">
                <h2>可以换成什么</h2>
                <p>如果疼痛、器械或难度不合适，先从这些替代动作开始。</p>
              </div>
              <div className="pill-row">
                {exercise.alternatives.map((item) => (
                  <span className="info-pill" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </article>

            <article className="surface stack-md">
              <div className="section-heading">
                <h2>视频演示</h2>
                <p>这是一条更完整的动态示范，适合跟着看节奏、幅度和动作连贯性。</p>
              </div>
              <a className="button-primary" href={exercise.videoUrl} rel="noreferrer" target="_blank">
                {exercise.videoTitle ?? "打开动作视频"}
              </a>
              <p className="muted-copy">
                当前版本先使用外部高质量教学视频链接；后面可以继续替换成站内视频资源。
              </p>
            </article>
          </section>
        </section>
      </div>
    </main>
  );
}

function resolveGeneratedImage(exerciseId: string, kind: "proper" | "mistake") {
  const relativePath = `/media/exercises/generated/${exerciseId}-${kind}.png`;
  const absolutePath = join(process.cwd(), "public", "media", "exercises", "generated", `${exerciseId}-${kind}.png`);

  return existsSync(absolutePath) ? relativePath : null;
}

function environmentLabel(value: "home" | "gym" | "both") {
  if (value === "home") {
    return "居家";
  }

  if (value === "gym") {
    return "健身房";
  }

  return "居家 / 健身房";
}

function readValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}
