"use client";

import { SessionProvider } from "next-auth/react";
import Footer from "./Footer";  
import Header from "./Header"; 

// This is a client component that will be wrapped by SessionProvider
function AuthContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen"> 
      <Header /> 
      <main className="flex-grow"> 
        {children}
      </main>P
      <Footer /> 
    </div>
  );
}

export default function AuthProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <AuthContent>{children}</AuthContent>
    </SessionProvider>
  );
}
