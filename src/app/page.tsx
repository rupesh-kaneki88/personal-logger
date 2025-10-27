"use client"; // Add this line for client-side interactivity and GSAP

import Image from "next/image";
import LogEntryForm from "../components/LogEntryForm";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef, useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react"; // Import signIn and useSession for client-side

import NameForm from "../components/NameForm";
import LoadingPage from "@/components/LoadingPage";
import AnimatedButton from "../components/AnimatedButton";

export default function Home() {
  const { data: session, status } = useSession(); // Use useSession for client-side session
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.from(".hero-text", { opacity: 0, y: 50, duration: 1, stagger: 0.3, ease: "power3.out" });
    gsap.fromTo(
      ".hero-button",
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)", delay: 1 }
    );
    gsap.from(".log-entry-form", { opacity: 0, y: 50, duration: 1, ease: "power3.out", delay: 0.5 });

    // Background animation
    gsap.to(".background", { duration: 10, backgroundPosition: "100% 0", ease: "none", repeat: -1, yoyo: true });

  }, { scope: containerRef });

  if (status === "loading") {
    return <LoadingPage />;
  }

  if (!session) {
    return (
      <div ref={containerRef} className="flex h-[70vh] flex-col md:items-center justify-center mt-20 md:mt-0 p-4 md:p-24 text-white text-center">
        <h1 className="text-5xl md:text-5xl text-left md:text-center font-extrabold mb-8 md:mb-6 hero-text">Welcome to Personal Logger</h1>
        <p className="text-xl mb-8 max-w-2xl text-left md:text-center hero-text">
          Your personal companion for tracking daily work, projects, and achievements.
          Stay organized, gain insights, and boost your productivity.
        </p>
        <AnimatedButton
          onClick={() => signIn()}
          className="hero-button opacity-0"
        >
          Get Started - Sign In
        </AnimatedButton>
        <p className="mt-8 italic font-thin text-sm md:text-lg text-gray-400 max-w-2xl hero-text">
          “I built this to save myself from the monthly struggle of remembering what I did, organizing logs, and rewriting reports — now it’s here to make that easier for everyone.”
        </p>
      </div>
    );
  }
  if (!session.user?.name) {
    return <NameForm />;
  }

  return (
    <div ref={containerRef} className="font-sans items-center justify-items-center min-h-[80vh] p-2 sm:p-2 text-white background">
      <main className="w-full flex flex-col items-center sm:items-start">
        <h1 className="text-4xl mt-8 md:mt-4 self-center font-bold">Welcome, {session.user?.name}!</h1>
        <div className="log-entry-form w-full">
          <LogEntryForm />
        </div>
      </main>
    </div>
  );
}