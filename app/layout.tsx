import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import { blogConfig } from "@/blog.config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: blogConfig.blog.name,
    template: `%s | ${blogConfig.blog.name}`,
  },
  description: blogConfig.blog.description,
  authors: [{ name: blogConfig.author.name, url: blogConfig.blog.url }],
  creator: blogConfig.author.name,
  openGraph: {
    type: "website",
    locale: blogConfig.blog.locale,
    url: blogConfig.blog.url,
    title: blogConfig.blog.name,
    description: blogConfig.blog.description,
    siteName: blogConfig.blog.name,
  },
  twitter: {
    card: "summary_large_image",
    title: blogConfig.blog.name,
    description: blogConfig.blog.description,
    creator: blogConfig.social.twitter ? `@${blogConfig.social.twitter.split('/').pop()}` : undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={blogConfig.blog.language}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
