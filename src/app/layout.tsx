import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import AuthProviders from "../components/AuthProviders";
import DynamicBackground from "../components/DynamicBackground"; // Import DynamicBackground
import { Toaster } from "sonner";
import MinimumLoadingWrapper from "../components/MinimumLoadingWrapper";
import ScrollToTop from "../components/ScrollToTop";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Personal Logger",
  description: "Your personal companion for tracking daily work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} font-sans antialiased`}>
        <DynamicBackground /> {/* Render DynamicBackground here */}
        <AuthProviders>
          <ScrollToTop />
          <MinimumLoadingWrapper>
            {children}
          </MinimumLoadingWrapper>
        </AuthProviders>
        <Toaster richColors />
      </body>
    </html>
  );
}