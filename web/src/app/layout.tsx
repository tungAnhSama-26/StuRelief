import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "StuRelief - Campus Exchange",
  description: "Nền tảng trao đổi đồ dùng học tập của sinh viên",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className="h-full antialiased"
      suppressHydrationWarning
      style={
        {
          '--font-sans': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        } as CSSProperties
      }
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k='sturelief.dashboard.theme';var t=localStorage.getItem(k);t=t==='light'||t==='dark'?t:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.style.colorScheme=t;}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
