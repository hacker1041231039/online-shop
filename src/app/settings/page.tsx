"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SignOutButton from "@/components/SignOutButton";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login?callbackUrl=/settings");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <main className="flex flex-1 items-center justify-center py-16">
        <span className="text-zinc-500">Loading…</span>
      </main>
    );
  }

  const user = session?.user;

  return (
    <main className="flex flex-1 flex-col gap-6 py-12">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="space-y-2">
        <p>
          <span className="font-medium">Name:</span> {user?.name || "—"}
        </p>
        <p>
          <span className="font-medium">Email:</span> {user?.email || "—"}
        </p>
        <p>
          <span className="font-medium">User id:</span> {user?.id || "—"}
        </p>
      </div>
      <SignOutButton />
    </main>
  );
}
