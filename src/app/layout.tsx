import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "体能计划",
    template: "%s | 体能计划",
  },
  description: "健身计划 MVP 的落地页、登录注册、评估问卷与仪表盘主流程。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="app-body">{children}</body>
    </html>
  );
}
