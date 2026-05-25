"use server";

import { redirect } from "next/navigation";

import { clearSessionCookie, getFitnessService, setSessionCookie } from "@/lib/server-app";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email.trim() || !password.trim()) {
    redirect("/auth?mode=login&error=请填写邮箱和密码。");
  }

  try {
    const result = getFitnessService().loginUser({ email, password });
    await setSessionCookie(result.session.token);
  } catch {
    redirect("/auth?mode=login&error=邮箱或密码不正确，请重新输入。");
  }

  redirect("/dashboard?welcome=back");
}

export async function registerAction(formData: FormData) {
  const name = String(formData.get("displayName") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!name.trim() || !email.trim() || !password.trim()) {
    redirect("/auth?mode=register&error=请先完成昵称、邮箱和密码。");
  }

  try {
    const result = getFitnessService().registerUser({ name, email, password });
    await setSessionCookie(result.session.token);
  } catch {
    redirect("/auth?mode=register&error=这个邮箱已经注册过了，请直接登录或换一个邮箱。");
  }

  redirect("/onboarding?welcome=1");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/auth?notice=已退出当前账号。");
}
