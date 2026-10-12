import { POST } from "@/app/api/register/route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
	prisma: {
		user: {
			findUnique: jest.fn(),
			create: jest.fn(),
		},
		$disconnect: jest.fn(),
	},
}));

jest.mock("bcryptjs", () => ({
	hash: jest.fn().mockResolvedValue("hashed-password"),
	compare: jest.fn().mockResolvedValue(true),
}));

const mockedPrisma = {
	user: {
		findUnique: prisma.user.findUnique as jest.Mock,
		create: prisma.user.create as jest.Mock,
	},
};

describe("/api/register", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("POST", () => {
		const validData = {
			name: "Test User",
			email: "test@example.com",
			password: "password123",
		};

		it("registers a user with valid data", async () => {
			mockedPrisma.user.findUnique.mockResolvedValue(null);
			mockedPrisma.user.create.mockResolvedValue({ id: "user-1", ...validData });

			const req = new Request("http://localhost/api/register", {
				method: "POST",
				body: JSON.stringify(validData),
			});

			const res = await POST(req);

			expect(res.status).toBe(201);
			const body = await res.json();
			expect(body.ok).toBe(true);
			expect(mockedPrisma.user.create).toHaveBeenCalled();
		});

		it("returns 400 when name is too short", async () => {
			const req = new Request("http://localhost/api/register", {
				method: "POST",
				body: JSON.stringify({ name: "A", email: "test@example.com", password: "password123" }),
			});

			const res = await POST(req);

			expect(res.status).toBe(400);
			const body = await res.json();
			expect(body.error).toContain("Name must be at least 2 characters");
		});

		it("returns 400 for invalid email", async () => {
			const req = new Request("http://localhost/api/register", {
				method: "POST",
				body: JSON.stringify({ name: "Test User", email: "invalid", password: "password123" }),
			});

			const res = await POST(req);

			expect(res.status).toBe(400);
			const body = await res.json();
			expect(body.error).toBe("Invalid email");
		});

		it("returns 400 for short password", async () => {
			const req = new Request("http://localhost/api/register", {
				method: "POST",
				body: JSON.stringify({ name: "Test User", email: "test@example.com", password: "short" }),
			});

			const res = await POST(req);

			expect(res.status).toBe(400);
			const body = await res.json();
			expect(body.error).toContain("Password must be at least 8 characters");
		});

		it("returns 409 when email already exists", async () => {
			mockedPrisma.user.findUnique.mockResolvedValue({ id: "existing-user" });

			const req = new Request("http://localhost/api/register", {
				method: "POST",
				body: JSON.stringify(validData),
			});

			const res = await POST(req);

			expect(res.status).toBe(409);
			const body = await res.json();
			expect(body.error).toBe("Email already registered");
		});

		it("returns 400 for invalid JSON body", async () => {
			const req = new Request("http://localhost/api/register", {
				method: "POST",
				body: "not json",
			});

			const res = await POST(req);

			expect(res.status).toBe(400);
		});
	});
});
