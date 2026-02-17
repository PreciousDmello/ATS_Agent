import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "WhizResume — AI-Powered Resume Builder & ATS Optimizer | WhizJunior",
    description: "WhizResume by WhizJunior — Create ATS-optimized resumes with AI enhancement. Upload your resume or build from scratch. Get instant ATS scoring, AI-powered content improvement, and professional templates.",
    keywords: "resume builder, ATS optimizer, AI resume, resume score, job application, career tools, WhizJunior",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <div className="layout">
                    {children}
                </div>
            </body>
        </html>
    );
}
