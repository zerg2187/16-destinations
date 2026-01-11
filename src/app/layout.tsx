import type { Metadata } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import "./globals.css";

const mPlusRounded = M_PLUS_Rounded_1c({
  weight: ["100", "300", "400", "500", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-m-plus-rounded",
});

export const metadata: Metadata = {
  title: {
    template: "%s | 16Destinations",
    default: "16Destinations",
  },
  description: "MBTI診断みたいなノリで、旅行の方向性を決めるアンケートを作れるメーカーです。",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "16Destinations",
  },
};

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${mPlusRounded.className} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
