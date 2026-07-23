import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { AuthProvider } from "@/components/layout/auth-provider";
import SiteNav from "@/components/layout/site-nav";
import SiteFooter from "@/components/layout/site-footer";
import LoadingScreen from "@/components/layout/loading-screen";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ahlesunnat Portal | Articles & Q&A Forum",
  description: "Islamic articles, Q&A forum, and knowledge sharing platform by Ahlesunnat Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${inter.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <AuthProvider>
          <LoadingScreen />
          <SiteNav />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
