import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClauseRadar — never miss a SaaS auto-renewal again",
  description: "Track contract end dates, notice windows, and renewals in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
