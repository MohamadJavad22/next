import type { Metadata } from "next";
import "./globals.css";
import { ContentProvider } from "./context/ContentContext";
import { ThemeProvider } from "./providers/ThemeProvider";

export const metadata: Metadata = {
  title: "stockcar.shop - مدیریت محتوای پیشرفته",
  description: "یک وبسایت زیبا با پنل مدیریت کامل",
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <ContentProvider>
            {children}
          </ContentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
