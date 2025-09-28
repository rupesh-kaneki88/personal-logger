"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function SignInButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex gap-4 ml-auto">
        <p className="text-sky-600">{session.user?.name}</p>
        <button onClick={() => signOut()} className="text-red-600">
          Sign Out
        </button>
      </div>
    );
  }
  return (
    <button onClick={() => signIn()} className="text-green-600 ml-auto">
      Sign In
    </button>
  );
}
