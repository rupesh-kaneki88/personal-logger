"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import SignInButton from "./SignInButton";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

export default function Header() {
  const { data: session } = useSession();
  const headerRef = useRef(null);

  useGSAP(() => {
    gsap.from(headerRef.current, { opacity: 0, y: -50, duration: 0.8, ease: "power3.out" });
    gsap.from(".header-item", { opacity: 0, x: -20, duration: 0.6, stagger: 0.2, ease: "power2.out", delay: 0.5 });
  }, { scope: headerRef });

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full bg-gray-900/50 backdrop-filter backdrop-blur-md border-b border-gray-700"
    >
      <div className="flex items-center justify-between h-20 max-w-5xl mx-auto px-4">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-white header-item">
            Personal Logger
          </Link>
          {session && (
            <Link
              href="/dashboard"
              className="header-item ml-6 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
            >
              Dashboard
            </Link>
          )}
        </div>
        <div className="header-item">
          <SignInButton />
        </div>
      </div>
    </header>
  );
}
