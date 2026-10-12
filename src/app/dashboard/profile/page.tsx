"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setSuccess("");

    const hasPasswordChange = newPassword.length > 0;

    if (hasPasswordChange) {
      if (!currentPassword) {
        setPasswordError("Current password is required");
        setLoading(false);
        return;
      }
      if (newPassword.length < 8) {
        setPasswordError("New password must be at least 8 characters");
        setLoading(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError("Passwords do not match");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || undefined,
          email: email || undefined,
          currentPassword: hasPasswordChange ? currentPassword : undefined,
          newPassword: hasPasswordChange ? newPassword : undefined,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (data?.error?.includes("Email")) {
          setEmailError(data.error);
        } else if (data?.error?.includes("password")) {
          setPasswordError(data.error);
        } else if (data?.error?.includes("name")) {
          setNameError(data.error);
        } else {
          setPasswordError(data?.error || "Update failed");
        }
        setLoading(false);
        return;
      }

      setSuccess("Profile updated successfully");

      await update();

      if (hasPasswordChange) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || status === "unauthenticated") {
    return (
      <main className="flex flex-1 items-center justify-center py-16">
        <span className="text-zinc-500">Loading…</span>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-6 py-12">
      <h1 className="text-2xl font-bold">Edit Profile</h1>

      <form className="space-y-6 max-w-md" onSubmit={handleSubmit}>
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Account Information</h2>
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              autoComplete="name"
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={session?.user?.name || ""}
            />
            {nameError && <p className="mt-1 text-sm text-red-600">{nameError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              autoComplete="email"
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={session?.user?.email || ""}
            />
            {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
          </div>
        </section>

        <section className="space-y-4 border-t border-zinc-200 pt-6">
          <h2 className="text-lg font-semibold">Change Password</h2>
          <p className="text-sm text-zinc-500">
            Leave blank to keep your current password.
          </p>
          <div>
            <label className="block text-sm font-medium">Current Password</label>
            <input
              type="password"
              autoComplete="current-password"
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">New Password</label>
            <input
              type="password"
              autoComplete="new-password"
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Confirm New Password</label>
            <input
              type="password"
              autoComplete="new-password"
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
        </section>

        {success && <p className="text-sm text-green-600">{success}</p>}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-accent py-2 font-medium text-accent-foreground hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <Link
            href="/dashboard"
            className="w-full rounded-md border px-4 py-2 text-center text-sm font-medium hover:bg-zinc-100"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}