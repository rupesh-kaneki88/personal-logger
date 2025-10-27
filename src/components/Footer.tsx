"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-700 flex flex-col items-center p-4 text-gray-400 text-sm mt-auto space-y-2">
      <nav className="flex space-x-4">
        <Link href="/privacy-policy" className="hover:text-white transition-colors duration-200">
          Privacy Policy
        </Link>
        <Link href="/terms-of-service" className="hover:text-white transition-colors duration-200">
          Terms of Service
        </Link>
      </nav>
      <p>&copy; {new Date().getFullYear()} Developed by &nbsp;
        <Link className="underline" href={"https://www.linkedin.com/in/rupesh-chavan-926409154/"} target="_blank">
          Rupesh.
        </Link>
      </p>
    </footer>
  );
}
