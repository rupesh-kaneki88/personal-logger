"use client";

import { SessionProvider } from "next-auth/react";
import Footer from "./Footer"; // Import Footer
import Header from "./Header"; // Import Header

// This is a client component that will be wrapped by SessionProvider
function AuthContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen"> {/* Added flex-col and min-h-screen for sticky footer */}
      <Header /> {/* Render Header here */}
      <main className="flex-grow"> {/* Added flex-grow to push footer to bottom */}
        {children}
      </main>
      <Footer /> {/* Render Footer here */}
    </div>
  );
}

export default function AuthProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthContent>{children}</AuthContent>
    </SessionProvider>
  );
}
