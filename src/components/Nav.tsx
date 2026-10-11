"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Nav() {
  const { data: session, status } = useSession();

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800">
      <Link href="/" className="text-lg font-bold">
        Online Shop
      </Link>
      {status === "loading" ? null : session?.user ? (
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-600">
            {session.user.name || session.user.email}
          </span>
          <button
            onClick={() => signOut()}
            className="rounded-md border px-3 py-1 text-sm font-medium hover:bg-zinc-100"
          >
            Sign out
          </button>
        </div>
      ) : (
        <Link
          href="/auth/login"
          className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground"
        >
          Sign in
        </Link>
      )}
    </header>
  );
}
