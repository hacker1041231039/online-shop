import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/admin" className="text-xl font-bold">
              Admin Dashboard
            </Link>
            <nav className="flex items-center gap-4">
              <Link
                href="/admin/orders"
                className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
              >
                Orders
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-zinc-500 hover:text-zinc-700"
              >
                Back to Shop
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}