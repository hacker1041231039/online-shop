jest.mock("next-auth", () => ({
	__esModule: true,
	default: jest.fn(() => ({
		handlers: { GET: jest.fn(), POST: jest.fn() },
		auth: jest.fn(),
		signIn: jest.fn(),
		signOut: jest.fn(),
	})),
}));

jest.mock("next-auth/providers/credentials", () => ({
	__esModule: true,
	default: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
	prisma: {
		user: {
			findUnique: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
		},
		$disconnect: jest.fn(),
	},
}));

import { isPublicPath } from "@/lib/auth";

describe("isPublicPath", () => {
	const publicPaths = [
		"/",
		"/auth/login",
		"/auth/register",
		"/api/auth",
		"/api/register",
	];

	it.each(publicPaths)("returns true for %s", (path) => {
		expect(isPublicPath(path)).toBe(true);
	});

	it("returns true for sub-paths of public paths", () => {
		expect(isPublicPath("/api/auth/signin")).toBe(true);
		expect(isPublicPath("/auth/login")).toBe(true);
		expect(isPublicPath("/api/register/check")).toBe(true);
	});

	it("returns false for protected paths", () => {
		expect(isPublicPath("/dashboard")).toBe(false);
		expect(isPublicPath("/dashboard/orders/123")).toBe(false);
		expect(isPublicPath("/admin")).toBe(false);
		expect(isPublicPath("/api/orders")).toBe(false);
		expect(isPublicPath("/api/profile")).toBe(false);
	});
});
