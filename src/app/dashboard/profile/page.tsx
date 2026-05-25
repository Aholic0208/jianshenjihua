import Link from "next/link";
import { redirect } from "next/navigation";

import { getFitnessService, getSessionUser } from "@/lib/server-app";

import styles from "../routes.module.css";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth");
  }

  const dashboardData = getFitnessService().fetchLatestDashboardData(user.id);
  const assessment = dashboardData.assessment;
  const plan = dashboardData.plan;

  if (!assessment || !plan) {
    return (
      <main className={styles.shell}>
        <div className={styles.wrap}>
          <div className={styles.topbar}>
            <div>
              <p className={styles.crumb}>Profile & Preferences</p>
              <h1>档案还不完整</h1>
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
            <p className={styles.lede}>先完成评估并生成至少一版计划，这里才会展示你的真实资料、偏好和安全提示。</p>
          </section>
        </div>
      </main>
    );
  }

  const bmi = calculateBmi(assessment.weightKg, assessment.heightCm);

  return (
    <main className={styles.shell}>
      <div className={styles.wrap}>
        <div className={styles.topbar}>
          <div>
            <p className={styles.crumb}>Profile & Preferences</p>
            <h1>个人资料与计划设置</h1>
          </div>
          <div className={styles.actions}>
            <Link className={styles.softAction} href="/dashboard">
              返回仪表盘
            </Link>
            <Link className={styles.action} href="/onboarding">
              更新评估信息
            </Link>
          </div>
        </div>

        <section className={`${styles.grid} ${styles.two}`}>
          <article className={styles.metric}>
            <span>年龄</span>
            <strong>{assessment.age} 岁</strong>
          </article>
          <article className={styles.metric}>
            <span>BMI</span>
            <strong>{bmi.toFixed(1)}</strong>
          </article>
          <article className={styles.metric}>
            <span>训练频次</span>
            <strong>每周 {assessment.trainingDaysPerWeek} 次</strong>
          </article>
          <article className={styles.metric}>
            <span>单次时长</span>
            <strong>{assessment.sessionMinutes} 分钟</strong>
          </article>
        </section>

        <section className={`${styles.grid} ${styles.two}`}>
          <article className={styles.panel}>
            <h2>个人档案</h2>
            <div className={styles.table}>
              <div className={styles.row}>
                <span>账号</span>
                <strong>{user.name}</strong>
              </div>
              <div className={styles.row}>
                <span>邮箱</span>
                <strong>{user.email}</strong>
              </div>
              <div className={styles.row}>
                <span>身体数据</span>
                <strong>
                  {assessment.heightCm} cm / {assessment.weightKg} kg / 目标{" "}
                  {assessment.targetWeightKg ? `${assessment.targetWeightKg} kg` : "未填写"}
                </strong>
              </div>
              <div className={styles.row}>
                <span>目标描述</span>
                <strong>{assessment.goalText}</strong>
              </div>
            </div>
          </article>

          <article className={styles.panel}>
            <h2>偏好与限制</h2>
            <div className={styles.table}>
              <div className={styles.row}>
                <span>训练场景</span>
                <strong>{environmentLabel(assessment.trainingEnvironment)}</strong>
              </div>
              <div className={styles.row}>
                <span>训练经验</span>
                <strong>{assessment.experience === "intermediate" ? "有基础" : "新手"}</strong>
              </div>
              <div className={styles.row}>
                <span>器械条件</span>
                <strong>{joinOrFallback(assessment.equipment, "未填写")}</strong>
              </div>
              <div className={styles.row}>
                <span>饮食限制 / 过敏</span>
                <strong>
                  {joinOrFallback(assessment.dietaryRestrictions, "无明显限制")} /{" "}
                  {joinOrFallback(assessment.allergies, "无明显过敏")}
                </strong>
              </div>
            </div>
          </article>
        </section>

        <section className={`${styles.grid} ${styles.two}`}>
          <article className={styles.panel}>
            <h2>安全提示</h2>
            <p className={styles.lede}>{plan.summary}</p>
            <div className={styles.pillRow}>
              {plan.safety.messages.map((message) => (
                <span className={styles.pill} key={message}>
                  {message}
                </span>
              ))}
            </div>
            <p className={styles.muted}>{plan.disclaimer}</p>
          </article>

          <article className={styles.panel}>
            <h2>最近修订</h2>
            <div className={styles.table}>
              <div className={styles.row}>
                <span>当前计划状态</span>
                <strong>{plan.status === "restricted" ? "受限计划" : "活动计划"}</strong>
              </div>
              <div className={styles.row}>
                <span>修订次数</span>
                <strong>{dashboardData.revisions.length} 次</strong>
              </div>
              <div className={styles.row}>
                <span>最近打卡</span>
                <strong>{dashboardData.recentCheckIns[0] ? `第 ${dashboardData.recentCheckIns[0].dayIndex} 天` : "暂无"}</strong>
              </div>
              <div className={styles.row}>
                <span>参考图片</span>
                <strong>{assessment.uploadedImages?.length ? `${assessment.uploadedImages.length} 张` : "未提供"}</strong>
              </div>
            </div>
          </article>
        </section>

        <section className={styles.panel}>
          <h2>伤病与特殊情况</h2>
          <div className={`${styles.grid} ${styles.two}`}>
            <article className={styles.message}>
              <span className={styles.tag}>伤病史</span>
              <p className={styles.response}>{joinOrFallback(assessment.injuries, "未填写伤病或疼痛史")}</p>
            </article>
            <article className={styles.message}>
              <span className={styles.tag}>慢性病 / 特殊情况</span>
              <p className={styles.response}>{joinOrFallback(assessment.chronicConditions, "未填写慢性病或特殊情况")}</p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}

function calculateBmi(weightKg: number, heightCm: number) {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

function joinOrFallback(values: string[], fallback: string) {
  return values.length ? values.join("、") : fallback;
}

function environmentLabel(value: "home" | "gym" | "both") {
  if (value === "home") {
    return "居家";
  }

  if (value === "gym") {
    return "健身房";
  }

  return "居家与健身房都可";
}
