import "./globals.css";
import { SessionProvider } from "next-auth/react";
import Nav from "@/components/Nav";

export const metadata = {
  title: "Online Shop",
  description: "Next.js + Prisma + PostgreSQL online shop",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <Nav />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
