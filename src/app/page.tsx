import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center gap-16 py-16">
      <h1 className="text-4xl font-bold">Online Shop</h1>
      <Image
        src="/vercel.svg"
        alt="logo"
        width={80}
        height={80}
        className="dark:invert"
      />
      <nav className="flex gap-4">
        <Link
          href="/auth/login"
          className="rounded-md bg-accent px-5 py-2.5 text-accent-foreground font-medium"
        >
          Sign in
        </Link>
        <Link
          href="/auth/register"
          className="rounded-md border px-5 py-2.5 font-medium"
        >
          Create account
        </Link>
      </nav>
    </main>
  );
}
