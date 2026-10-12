import { PUT } from "@/app/api/profile/route";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

jest.mock("@/lib/auth", () => ({
	auth: jest.fn(),
	handlers: { GET: jest.fn(), POST: jest.fn() },
	signIn: jest.fn(),
	signOut: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
	prisma: {
		user: {
			findUnique: jest.fn(),
			update: jest.fn(),
		},
		$disconnect: jest.fn(),
	},
}));

jest.mock("bcryptjs", () => ({
	hash: jest.fn().mockResolvedValue("hashed-password"),
	compare: jest.fn().mockResolvedValue(true),
}));

const mockedAuth: jest.Mock = auth as unknown as jest.Mock;
const mockedPrisma = {
	user: {
		findUnique: prisma.user.findUnique as jest.Mock,
		update: prisma.user.update as jest.Mock,
	},
};

describe("/api/profile", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("PUT", () => {
		it("returns 401 when not authenticated", async () => {
			mockedAuth.mockResolvedValue(null);

			const req = new Request("http://localhost/api/profile", {
				method: "PUT",
				body: JSON.stringify({ name: "New Name" }),
			});

			const res = await PUT(req);

			expect(res.status).toBe(401);
		});

		it("updates name successfully", async () => {
			mockedAuth.mockResolvedValue({
				user: { id: "user-1", role: "USER" },
			});
			mockedPrisma.user.findUnique.mockResolvedValue({
				id: "user-1",
				email: "test@example.com",
			});

			const req = new Request("http://localhost/api/profile", {
				method: "PUT",
				body: JSON.stringify({ name: "New Name" }),
			});

			const res = await PUT(req);

			expect(res.status).toBe(200);
			expect(mockedPrisma.user.update).toHaveBeenCalledWith({
				where: { id: "user-1" },
				data: { name: "New Name" },
			});
		});

		it("updates email successfully", async () => {
			mockedAuth.mockResolvedValue({
				user: { id: "user-1", role: "USER" },
			});
			mockedPrisma.user.findUnique.mockResolvedValue({
				id: "user-1",
				email: "test@example.com",
			});

			const req = new Request("http://localhost/api/profile", {
				method: "PUT",
				body: JSON.stringify({ email: "new@example.com" }),
			});

			const res = await PUT(req);

			expect(res.status).toBe(200);
			expect(mockedPrisma.user.update).toHaveBeenCalledWith({
				where: { id: "user-1" },
				data: { email: "new@example.com" },
			});
		});

		it("returns 400 for invalid email", async () => {
			mockedAuth.mockResolvedValue({
				user: { id: "user-1", role: "USER" },
			});
			mockedPrisma.user.findUnique.mockResolvedValue({
				id: "user-1",
				email: "test@example.com",
			});

			const req = new Request("http://localhost/api/profile", {
				method: "PUT",
				body: JSON.stringify({ email: "not-an-email" }),
			});

			const res = await PUT(req);

			expect(res.status).toBe(400);
			const body = await res.json();
			expect(body.error).toBe("Invalid email");
		});

		it("returns 409 when email is already in use", async () => {
			mockedAuth.mockResolvedValue({
				user: { id: "user-1", role: "USER" },
			});
			mockedPrisma.user.findUnique.mockResolvedValueOnce({
				id: "user-1",
				email: "test@example.com",
			}).mockResolvedValueOnce({
				id: "user-2",
				email: "taken@example.com",
			});

			const req = new Request("http://localhost/api/profile", {
				method: "PUT",
				body: JSON.stringify({ email: "taken@example.com" }),
			});

			const res = await PUT(req);

			expect(res.status).toBe(409);
			const body = await res.json();
			expect(body.error).toBe("Email already in use");
		});

		it("changes password when current password is correct", async () => {
			mockedAuth.mockResolvedValue({
				user: { id: "user-1", role: "USER" },
			});
			mockedPrisma.user.findUnique.mockResolvedValue({
				id: "user-1",
				email: "test@example.com",
				passwordHash: "old-hash",
			});

			const req = new Request("http://localhost/api/profile", {
				method: "PUT",
				body: JSON.stringify({
					currentPassword: "oldpass",
					newPassword: "newpassword123",
				}),
			});

			const res = await PUT(req);

			expect(res.status).toBe(200);
		});

		it("returns 400 when new password is less than 8 chars", async () => {
			mockedAuth.mockResolvedValue({
				user: { id: "user-1", role: "USER" },
			});
			mockedPrisma.user.findUnique.mockResolvedValue({
				id: "user-1",
				email: "test@example.com",
				passwordHash: "old-hash",
			});

			const req = new Request("http://localhost/api/profile", {
				method: "PUT",
				body: JSON.stringify({
					currentPassword: "oldpass",
					newPassword: "short",
				}),
			});

			const res = await PUT(req);

			expect(res.status).toBe(400);
			const body = await res.json();
			expect(body.error).toBe("New password must be at least 8 characters");
		});

		it("returns 400 when current password is wrong", async () => {
			(bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

			mockedAuth.mockResolvedValue({
				user: { id: "user-1", role: "USER" },
			});
			mockedPrisma.user.findUnique.mockResolvedValue({
				id: "user-1",
				email: "test@example.com",
				passwordHash: "old-hash",
			});

			const req = new Request("http://localhost/api/profile", {
				method: "PUT",
				body: JSON.stringify({
					currentPassword: "wrongpass",
					newPassword: "newpassword123",
				}),
			});

			const res = await PUT(req);

			expect(res.status).toBe(400);
			const body = await res.json();
			expect(body.error).toBe("Current password is incorrect");
		});
	});
});
