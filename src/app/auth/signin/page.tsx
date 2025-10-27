"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const formRef = useRef(null);

  useGSAP(() => {
    gsap.from(formRef.current, { opacity: 0, y: 50, duration: 0.8, ease: "power3.out" });
  }, { scope: formRef });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result = await signIn("email", {
        redirect: false,
        email,
        callbackUrl: "/", // Redirect to home page after successful sign-in
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        setMessage("A verification link has been sent to your email address.");
        setEmail(""); // Clear email field
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-white">
      <div ref={formRef} className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
        <h1 className="text-3xl font-bold text-center text-white">Sign In</h1>
        <p className="text-center text-gray-300">Enter your email to receive a magic link.</p>

        {error && <p className="text-red-400 text-center">{error}</p>}
        {message && <p className="text-green-400 text-center">{message}</p>}

        {/* <div>
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-gray-900 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.44 12.204c0-.639-.057-1.25-.164-1.84H12v3.49h6.294c-.273 1.654-1.052 3.057-2.343 4.007v2.28h2.93c1.717-1.58 2.713-3.91 2.713-6.647z" fill="#4285F4"/>
              <path d="M12 23c3.24 0 5.94-1.07 7.92-2.92l-2.93-2.28c-1.05 0-1.94-.28-2.71-.76-1.05-.65-1.78-1.6-2.07-2.76h-3.01v2.33c.83 1.64 2.07 2.88 3.68 3.58z" fill="#34A853"/>
              <path d="M4.68 14.09c-.2-.65-.31-1.35-.31-2.09s.11-1.44.31-2.09V7.58H1.66C.6 9.73 0 12.37 0 15s.6 5.27 1.66 7.42l3.02-2.33c-.2-.65-.31-1.35-.31-2.09z" fill="#FBBC05"/>
              <path d="M12 4.58c1.77 0 3.35.61 4.6 1.79l2.6-2.59C17.94 1.78 15.24 0 12 0 8.76 0 6.06 1.07 4.08 2.92l2.93 2.28c.77-.48 1.66-.76 2.71-.76z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
          <p className="text-center text-gray-400 text-xs mt-2">This will enable Google Calendar synchronization.</p>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-800 text-gray-300">Or continue with</span>
        </div> */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-700"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
          </div>
        </form>
        <div className="text-center">
          <button
            onClick={() => router.back()}
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
