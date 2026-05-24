import Link from "next/link";
import { redirect } from "next/navigation";

import { getFitnessService, getSessionUser } from "@/lib/server-app";

import { adjustmentAction } from "../actions";
import styles from "../routes.module.css";

type SearchParamsInput = Promise<Record<string, string | string[] | undefined>>;

type AdjustmentsPageProps = {
  searchParams?: SearchParamsInput;
};

const suggestionPrompts = [
  "今天膝盖不舒服，帮我把下肢动作换掉。",
  "我只有 25 分钟，帮我压缩今天的训练。",
  "没有鸡胸肉了，帮我换成更好买的蛋白来源。",
  "我只有瑜伽垫和弹力带，能不能改成居家版本？",
];

export default async function AdjustmentsPage({ searchParams }: AdjustmentsPageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth");
  }

  const params = (await searchParams) ?? {};
  const notice = readValue(params.saved) === "1" ? "调整请求已保存，新的建议已经写入本地记录。" : "";
  const error = readValue(params.error);
  const dashboardData = getFitnessService().fetchLatestDashboardData(user.id);
  const plan = dashboardData.plan;

  if (!plan) {
    return (
      <main className={styles.shell}>
        <div className={styles.wrap}>
          <div className={styles.topbar}>
            <div>
              <p className={styles.crumb}>Plan Adjustment</p>
              <h1>还没有可以调整的计划</h1>
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
            <p className={styles.lede}>先生成至少一版计划，系统才能根据你的反馈保存替换建议和修订记录。</p>
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
            <p className={styles.crumb}>Plan Adjustment</p>
            <h1>计划调整工作台</h1>
          </div>
          <div className={styles.actions}>
            <Link className={styles.softAction} href="/dashboard">
              返回仪表盘
            </Link>
            <Link className={styles.action} href="/dashboard/check-in">
              去做今日打卡
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
            <h2>你可以这样提问</h2>
            <div className={styles.pillRow}>
              {suggestionPrompts.map((suggestion) => (
                <span className={styles.pill} key={suggestion}>
                  {suggestion}
                </span>
              ))}
            </div>
          </article>

          <article className={styles.panel}>
            <h2>提交调整请求</h2>
            <form action={adjustmentAction}>
              <input name="planId" type="hidden" value={plan.id} />
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label htmlFor="message">告诉系统你遇到了什么问题</label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="例如：今天深蹲膝盖痛，想换一个更安全的动作。"
                  />
                </div>
              </div>
              <div className={styles.actions}>
                <button className={styles.action} type="submit">
                  发送调整请求
                </button>
              </div>
            </form>
          </article>
        </section>

        <section className={styles.panel}>
          <h2>最近对话</h2>
          <div className={styles.grid}>
            {dashboardData.recentMessages.length ? (
              dashboardData.recentMessages.map((message) => (
                <article className={styles.message} key={message.id}>
                  <span className={styles.tag}>{message.role === "assistant" ? "系统建议" : "你的反馈"}</span>
                  <h3>{message.kind === "adjustment_response" ? "计划已响应" : "新的调整反馈"}</h3>
                  <p className={styles.response}>{message.content}</p>
                </article>
              ))
            ) : (
              <article className={styles.message}>
                <span className={styles.tag}>暂无记录</span>
                <h3>还没有提交过调整请求</h3>
                <p className={styles.response}>当你告诉系统“做不到”“太累”“膝盖不舒服”时，新的建议会保存在这里。</p>
              </article>
            )}
          </div>
        </section>

        <section className={styles.panel}>
          <h2>最近修订摘要</h2>
          <div className={styles.grid}>
            {dashboardData.revisions.length ? (
              dashboardData.revisions.map((revision) => (
                <article className={styles.message} key={revision.id}>
                  <span className={styles.tag}>{revision.adjustmentType}</span>
                  <h3>{revision.reason}</h3>
                  <p className={styles.response}>{revision.message}</p>
                </article>
              ))
            ) : (
              <article className={styles.message}>
                <span className={styles.tag}>等待反馈</span>
                <h3>还没有计划修订</h3>
                <p className={styles.response}>第一条修订会在你提交调整请求后自动生成，并和聊天记录一起保存在本地。</p>
              </article>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function readValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}
