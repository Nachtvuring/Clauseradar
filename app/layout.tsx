import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClauseRadar — never miss a SaaS auto-renewal again",
  description: "Track contract end dates, notice windows, and renewals in one place.",
};

// Runs before hydration. Picks up stored theme or falls back to OS preference.
const themeBootScript = `
(function(){try{
  var s=localStorage.getItem('theme');
  var t=s||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  document.documentElement.setAttribute('data-theme',t);
}catch(e){}})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
