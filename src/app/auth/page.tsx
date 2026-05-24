import Link from "next/link";

import { getSessionUser } from "@/lib/server-app";

import { loginAction, logoutAction, registerAction } from "./actions";

type SearchParamsInput = Promise<Record<string, string | string[] | undefined>>;

type AuthPageProps = {
  searchParams?: SearchParamsInput;
};

const accountNotes = [
  "注册后会进入评估问卷，计划和反馈会保存在当前本地数据库。",
  "登录后直接回到你的训练首页，继续查看今日计划、饮食建议和最近调整。",
  "当前版本是本地 MVP，不替代医疗建议，也不会把数据自动同步到公网。",
];

const implementationNotes = [
  { label: "账号形态", value: "本地邮箱 + 密码，会话用 Cookie 维持 7 天。" },
  { label: "后续去向", value: "注册去评估，登录回仪表盘，退出后回到这里。" },
  { label: "当前状态", value: "已经接入真实本地仓储，不再只是示例跳转。" },
];

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = (await searchParams) ?? {};
  const error = readValue(params.error);
  const notice = readValue(params.notice);
  const activeMode = readValue(params.mode, "login");
  const sessionUser = await getSessionUser();

  return (
    <main className="screen">
      <div className="page-frame">
        <header className="topbar">
          <Link className="brand-mark" href="/">
            体能计划
          </Link>
          <nav className="topbar-nav" aria-label="次级导航">
            <Link href="/">返回入口</Link>
            {sessionUser ? <Link href="/dashboard">进入仪表盘</Link> : <Link href="/onboarding">查看评估页</Link>}
          </nav>
        </header>

        <section className="auth-grid">
          <div className="stack-lg">
            <div className="stack-md">
              <span className="status-pill">登录 / 注册</span>
              <h1 className="page-title">先建立你的本地账号，再进入真正会保存的训练流程。</h1>
              <p className="lead-text">
                这一版已经接上本地会话和 SQLite 数据。注册后填写评估问卷，系统会生成你的 4 周计划；后续登录能继续查看计划、打卡和调整记录。
              </p>
            </div>

            {error ? (
              <section className="surface notice-banner is-error">
                <strong>提交没有成功</strong>
                <p>{error}</p>
              </section>
            ) : null}

            {notice ? (
              <section className="surface notice-banner is-success">
                <strong>状态更新</strong>
                <p>{notice}</p>
              </section>
            ) : null}

            <section className="surface">
              <div className="section-heading">
                <h2>当前账号流程</h2>
                <p>先把首次创建和回访继续执行分开，后面的问卷和仪表盘才会干净。</p>
              </div>
              <div className="list-stack">
                {accountNotes.map((note) => (
                  <div className="list-row" key={note}>
                    <div>
                      <strong>{note}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="surface">
              <div className="section-heading">
                <h2>实现状态</h2>
              </div>
              <div className="list-stack">
                {implementationNotes.map((item) => (
                  <div className="list-row" key={item.label}>
                    <div>
                      <strong>{item.label}</strong>
                      <p>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {sessionUser ? (
              <section className="surface">
                <div className="section-heading">
                  <h2>当前已登录</h2>
                  <p>你可以直接继续，也可以退出后切换到另一个本地账号。</p>
                </div>
                <div className="profile-block">
                  <strong>{sessionUser.name}</strong>
                  <p>{sessionUser.email}</p>
                  <span className="status-pill subtle-pill">会话已生效</span>
                </div>
                <div className="action-row">
                  <Link className="button-primary" href="/dashboard">
                    继续查看计划
                  </Link>
                  <form action={logoutAction}>
                    <button className="button-secondary" type="submit">
                      退出当前账号
                    </button>
                  </form>
                </div>
              </section>
            ) : null}
          </div>

          <div className="stack-md">
            <section className="surface">
              <div className="section-heading">
                <h2>已有账号</h2>
                <p>回访用户直接回到自己的仪表盘。</p>
              </div>
              <form action={loginAction} className="form-stack">
                <div className="field">
                  <label htmlFor="login-email">邮箱</label>
                  <input
                    defaultValue={activeMode === "login" ? "linran@local.fit" : ""}
                    id="login-email"
                    name="email"
                    placeholder="you@example.com"
                    required
                    type="email"
                  />
                </div>
                <div className="field">
                  <label htmlFor="login-password">密码</label>
                  <input
                    defaultValue={activeMode === "login" ? "fitness-2026" : ""}
                    id="login-password"
                    name="password"
                    placeholder="请输入密码"
                    required
                    type="password"
                  />
                </div>
                <button className="button-primary" type="submit">
                  登录并进入仪表盘
                </button>
              </form>
            </section>

            <section className="surface">
              <div className="section-heading">
                <h2>首次创建计划</h2>
                <p>先登记一个本地账号，再进入评估问卷生成计划。</p>
              </div>
              <form action={registerAction} className="form-stack">
                <div className="field">
                  <label htmlFor="register-name">昵称</label>
                  <input defaultValue="林然" id="register-name" name="displayName" required type="text" />
                </div>
                <div className="field">
                  <label htmlFor="register-email">邮箱</label>
                  <input defaultValue="linran@local.fit" id="register-email" name="email" required type="email" />
                </div>
                <div className="field">
                  <label htmlFor="register-password">密码</label>
                  <input
                    defaultValue="fitness-2026"
                    id="register-password"
                    name="password"
                    required
                    type="password"
                  />
                </div>
                <button className="button-primary" type="submit">
                  注册并开始评估
                </button>
              </form>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function readValue(value: string | string[] | undefined, fallback = "") {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}
