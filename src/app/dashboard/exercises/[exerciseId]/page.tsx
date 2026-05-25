import Link from "next/link";
import { notFound } from "next/navigation";

import { createExerciseDetailView } from "@/lib/dashboard-view";

import styles from "../../routes.module.css";

interface ExerciseDetailPageProps {
  params: Promise<{ exerciseId: string }>;
}

export default async function ExerciseDetailPage({ params }: ExerciseDetailPageProps) {
  const { exerciseId } = await params;
  const exercise = createExerciseDetailView(exerciseId);

  if (!exercise) {
    notFound();
  }

  return (
    <main className={styles.shell}>
      <div className={styles.wrap}>
        <div className={styles.topbar}>
          <div>
            <p className={styles.crumb}>Exercise Detail</p>
            <h1>{exercise.title}</h1>
          </div>
          <div className={styles.actions}>
            <Link className={styles.softAction} href="/dashboard">
              返回仪表盘
            </Link>
            <a className={styles.action} href={exercise.videoUrl} target="_blank" rel="noreferrer">
              打开视频演示
            </a>
          </div>
        </div>

        <section className={styles.hero}>
          <div className={styles.poster}>
            <img alt={exercise.title} src={exercise.imageUrl} />
          </div>

          <div className={styles.panel}>
            <p className={styles.lede}>
              这里展示的是训练项详情页的真实结构：用户从每日计划点击动作后，会看到标准演示、动作步骤、常见错误、替代动作和禁忌提示。
            </p>
            <div className={`${styles.grid} ${styles.two}`}>
              <article className={styles.metric}>
                <span>主要肌群</span>
                <strong>{exercise.muscles.join(" / ")}</strong>
              </article>
              <article className={styles.metric}>
                <span>所需器械</span>
                <strong>{exercise.equipment.length > 0 ? exercise.equipment.join(" / ") : "无需器械"}</strong>
              </article>
            </div>
            <div className={styles.pillRow}>
              {exercise.contraindications.map((item) => (
                <span className={styles.pill} key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.grid} ${styles.two}`}>
          <article className={styles.panel}>
            <h2>动作步骤</h2>
            <ol className={styles.list}>
              {exercise.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>

          <article className={styles.panel}>
            <h2>动作要点</h2>
            <ul className={styles.list}>
              {exercise.cues.map((cue) => (
                <li key={cue}>{cue}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className={styles.columns}>
          <article className={styles.panel}>
            <h3>常见错误</h3>
            <ul className={styles.list}>
              {exercise.commonMistakes.map((mistake) => (
                <li key={mistake}>{mistake}</li>
              ))}
            </ul>
          </article>

          <article className={styles.panel}>
            <h3>替代动作</h3>
            <div className={styles.pillRow}>
              {exercise.alternatives.map((item) => (
                <span className={styles.pill} key={item}>
                  {item}
                </span>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
