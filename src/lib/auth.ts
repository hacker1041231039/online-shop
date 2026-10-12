import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { DefaultSession } from "next-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const PUBLIC_PATHS: ReadonlyArray<string> = [
	"/",
	"/auth/login",
	"/auth/register",
	"/api/auth",
	"/api/register",
];

export const isPublicPath = (pathname: string): boolean =>
	PUBLIC_PATHS.some(
		(path) => pathname === path || pathname.startsWith(path + "/")
	);

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
	session: { strategy: "jwt" },
	secret: process.env.NEXTAUTH_SECRET,
	pages: {
		signIn: "/auth/login",
	},
	providers: [
		Credentials({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) return null;

				const user = await prisma.user.findUnique({
					where: { email: credentials.email as string },
				});

				if (!user || !user.passwordHash) return null;

				const isValid = await bcrypt.compare(
					credentials.password as string,
					user.passwordHash
				);

				if (!isValid) return null;

				return {
					id: user.id,
					email: user.email,
					name: user.name ?? undefined,
					image: user.image ?? undefined,
					role: user.role,
				};
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.sub = user.id;
				token.role = (user as { role: "USER" | "ADMIN" }).role;
			}
			return token;
		},
		async session({ session, token }) {
			if (token?.sub && session.user) {
				session.user.id = token.sub;
				session.user.role = token.role as "USER" | "ADMIN";
			}
			return session;
		},
		authorized({ request, auth }: { request: NextRequest; auth: unknown }) {
			const { pathname } = request.nextUrl;

			if (isPublicPath(pathname)) return true;

			if (!auth) {
				if (pathname.startsWith("/api/")) {
					return NextResponse.json(
						{ error: "Unauthorized" },
						{ status: 401 }
					);
				}
				return false;
			}

			return true;
		},
	},
});