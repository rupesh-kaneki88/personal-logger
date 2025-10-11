"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import SignInButton from "./SignInButton";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";

export default function Header() {
  const { data: session } = useSession();
  const headerRef = useRef(null);

  useGSAP(() => {
    gsap.from(headerRef.current, { opacity: 0, y: -50, duration: 0.8, ease: "power3.out" });
    gsap.from(".header-item", { opacity: 0, x: -20, duration: 0.6, stagger: 0.2, ease: "power2.out", delay: 0.5 });
  }, { scope: headerRef });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const topPathRef = useRef<SVGPathElement>(null);
  const middlePathRef = useRef<SVGPathElement>(null);
  const bottomPathRef = useRef<SVGPathElement>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  useGSAP(() => {
    if (mobileMenuRef.current) {
      if (isMobileMenuOpen) {
        mobileMenuRef.current.style.display = "block"; // Ensure it's visible before animating
        gsap.fromTo(
          mobileMenuRef.current,
          { height: 0, opacity: 0, overflow: "hidden" },
          { height: "auto", opacity: 1, duration: 0.7, ease: "elastic.out(1, 0.75)", overflow: "hidden" }
        );
        // Animate burger to cross
        gsap.to(topPathRef.current, { d: "M6 18L18 6", rotate: 45, transformOrigin: "50% 50%", duration: 0.3 });
        gsap.to(middlePathRef.current, { opacity: 0, duration: 0.3 });
        gsap.to(bottomPathRef.current, { d: "M6 6l12 12", rotate: -45, transformOrigin: "50% 50%", duration: 0.3 });
      } else {
        gsap.to(mobileMenuRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.7,
          ease: "elastic.out(1, 0.75)",
          overflow: "hidden",
          // Removed onComplete: () => (mobileMenuRef.current!.style.display = "none"),
        });
        // Animate cross to burger
        gsap.to(topPathRef.current, { d: "M4 6h16", rotate: 0, transformOrigin: "50% 50%", duration: 0.3 });
        gsap.to(middlePathRef.current, { opacity: 1, duration: 0.3 });
        gsap.to(bottomPathRef.current, { d: "M4 18h16", rotate: 0, transformOrigin: "50% 50%", duration: 0.3 });
      }
    }
  }, [isMobileMenuOpen]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full bg-gray-900/50 backdrop-filter backdrop-blur-md border-b border-gray-700"
    >
      <div className="flex items-center justify-between h-20 max-w-5xl mx-auto px-4">
        <Link href="/" className="text-xl sm:text-2xl font-bold text-white header-item">
          Personal Logger
        </Link>
        <div className="flex items-center sm:hidden"> {/* Mobile menu button for small screens */}
          <button
            onClick={toggleMobileMenu}
            className="text-white focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                ref={topPathRef}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16"
              />
              <path
                ref={middlePathRef}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 12h16"
              />
              <path
                ref={bottomPathRef}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 18h16"
              />
            </svg>
          </button>
        </div>
        <div className="hidden sm:flex items-center flex-grow justify-center">
          <Link
            href="/"
            className="header-item ml-6 px-4 py-2 rounded-md text-white transition-colors duration-200"
            onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.1, ease: "elastic.out(1, 0.3)", duration: 0.5 })}
            onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, ease: "elastic.out(1, 0.3)", duration: 0.5 })}
          >
            Home
          </Link>
          {session && (
            <Link
              href="/dashboard"
              className="header-item ml-6 px-4 py-2 rounded-md text-white transition-colors duration-200"
              onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.1, ease: "elastic.out(1, 0.3)", duration: 0.5 })}
              onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, ease: "elastic.out(1, 0.3)", duration: 0.5 })}
            >
              Dashboard
            </Link>
          )}
          {session && (
            <Link
              href="/logs"
              className="header-item ml-6 px-4 py-2 rounded-md text-white transition-colors duration-200"
              onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.1, ease: "elastic.out(1, 0.3)", duration: 0.5 })}
              onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, ease: "elastic.out(1, 0.3)", duration: 0.5 })}
            >
              Logs
            </Link>
          )}
          {session && (
            <Link
              href="/reports"
              className="header-item ml-6 px-4 py-2 rounded-md text-white transition-colors duration-200"
              onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.1, ease: "elastic.out(1, 0.3)", duration: 0.5 })}
              onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, ease: "elastic.out(1, 0.3)", duration: 0.5 })}
            >
              Reports
            </Link>
          )}
          {session && (
            <Link
              href="/tasks"
              className="header-item ml-6 px-4 py-2 rounded-md text-white transition-colors duration-200"
              onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.1, ease: "elastic.out(1, 0.3)", duration: 0.5 })}
              onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, ease: "elastic.out(1, 0.3)", duration: 0.5 })}
            >
              Tasks
            </Link>
          )}
        </div>
        <div className="header-item hidden sm:block"> {/* Hide on small screens */}
          <SignInButton />
        </div>
      </div>
      <div
        ref={mobileMenuRef}
        className="sm:hidden bg-gray-800 border-t border-gray-700 py-2"
        style={{ height: 0, overflow: "hidden" }} // Initial state for animation
      >
        <div className="flex flex-col items-center space-y-2">
          <Link
            href="/"
            className="header-item px-4 py-2 rounded-md text-white transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          {session && (
            <Link
              href="/dashboard"
              className="header-item px-4 py-2 rounded-md text-white transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
          )}
          {session && (
            <Link
              href="/logs"
              className="header-item px-4 py-2 rounded-md text-white transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Logs
            </Link>
          )}
          {session && (
            <Link
              href="/reports"
              className="header-item px-4 py-2 rounded-md text-white transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Reports
            </Link>
          )}
          {session && (
            <Link
              href="/tasks"
              className="header-item px-4 py-2 rounded-md text-white transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Tasks
            </Link>
          )}
          <div className="header-item">
            <SignInButton />
          </div>
        </div>
      </div>
    </header>
  );
}
