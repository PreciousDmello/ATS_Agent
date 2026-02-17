import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    display: 'swap',
    variable: '--font-inter',
});

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#ffffff',
};

export const metadata: Metadata = {
    title: "WhizResume | #1 AI Resume Builder & ATS Checker",
    description: "Create professional, ATS-optimized resumes in minutes. Free AI resume builder with real-time scoring, expert enhancements, and PDF/Word downloads.",
    applicationName: "WhizResume",
    authors: [{ name: "WhizJunior" }],
    keywords: ["resume builder", "ATS resume checker", "AI resume writer", "CV maker", "resume templates", "free resume builder", "WhizResume"],
    metadataBase: new URL('https://whizresume.onrender.com'),
    openGraph: {
        title: "WhizResume | Build ATS-Optimized Resumes with AI",
        description: "Land more interviews with a 99% ATS-compatible resume. Use our free AI builder to score, enhance, and format your resume instantly.",
        url: 'https://whizresume.onrender.com',
        siteName: 'WhizResume',
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: "WhizResume | AI Resume Builder",
        description: "Build a professional resume that beats the bots. Free ATS scoring and AI formatting.",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={inter.variable}>
            <head>
                <link rel="canonical" href="https://whizresume.onrender.com" />
            </head>
            <body className={inter.className}>{children}</body>
        </html>
    );
}
