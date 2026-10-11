"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-zinc-100"
    >
      Sign out
    </button>
  );
}
