import { GET, POST } from "@/app/api/orders/route";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/auth", () => ({
	auth: jest.fn(),
	handlers: { GET: jest.fn(), POST: jest.fn() },
	signIn: jest.fn(),
	signOut: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
	prisma: {
		order: {
			findMany: jest.fn(),
			findUnique: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
		},
		product: {
			findMany: jest.fn(),
			findUnique: jest.fn(),
		},
		orderItem: {
			create: jest.fn(),
		},
		$disconnect: jest.fn(),
		$transaction: jest.fn(),
	},
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedAuth: jest.Mock<any> = auth as any;
const mockedPrisma = {
	order: {
		findMany: prisma.order.findMany as jest.Mock,
		findUnique: prisma.order.findUnique as jest.Mock,
		create: prisma.order.create as jest.Mock,
	},
	product: {
		findMany: prisma.product.findMany as jest.Mock,
		findUnique: prisma.product.findUnique as jest.Mock,
	},
	orderItem: {
		create: prisma.orderItem.create as jest.Mock,
	},
};

describe("/api/orders", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("GET", () => {
		it("returns 401 when not authenticated", async () => {
			mockedAuth.mockResolvedValue(null);

			const res = await GET();

			expect(res.status).toBe(401);
			const body = await res.json();
			expect(body.error).toBe("Unauthorized");
		});

		it("returns orders for authenticated user", async () => {
			mockedAuth.mockResolvedValue({
				user: { id: "user-1", role: "USER" },
			});

			const mockOrders = [
				{
					id: "order-1",
					total: "99.99",
					status: "PENDING",
					items: [],
				},
			];
			mockedPrisma.order.findMany.mockResolvedValue(mockOrders);

			const res = await GET();

			expect(res.status).toBe(200);
			const body = await res.json();
			expect(body).toEqual(mockOrders);
			expect(mockedPrisma.order.findMany).toHaveBeenCalledWith({
				where: { userId: "user-1" },
				include: { items: { include: { product: true } } },
				orderBy: { createdAt: "desc" },
			});
		});
	});

	describe("POST", () => {
		it("returns 401 when not authenticated", async () => {
			mockedAuth.mockResolvedValue(null);

			const req = new Request("http://localhost/api/orders", {
				method: "POST",
				body: JSON.stringify({ items: [] }),
			});

			const res = await POST(req);

			expect(res.status).toBe(401);
			const body = await res.json();
			expect(body.error).toBe("Unauthorized");
		});

		it("returns 400 for invalid body (missing items)", async () => {
			mockedAuth.mockResolvedValue({
				user: { id: "user-1", role: "USER" },
			});

			const req = new Request("http://localhost/api/orders", {
				method: "POST",
				body: JSON.stringify({}),
			});

			const res = await POST(req);

			expect(res.status).toBe(400);
			const body = await res.json();
			expect(body.error).toBe("Invalid request body");
		});

		it("returns 400 for empty items array", async () => {
			mockedAuth.mockResolvedValue({
				user: { id: "user-1", role: "USER" },
			});

			const req = new Request("http://localhost/api/orders", {
				method: "POST",
				body: JSON.stringify({ items: [] }),
			});

			const res = await POST(req);

			expect(res.status).toBe(400);
		});

		it("returns 400 for invalid item data", async () => {
			mockedAuth.mockResolvedValue({
				user: { id: "user-1", role: "USER" },
			});

			const req = new Request("http://localhost/api/orders", {
				method: "POST",
				body: JSON.stringify({
					items: [{ productId: "", quantity: 0, price: 0 }],
				}),
			});

			const res = await POST(req);

			expect(res.status).toBe(400);
			const body = await res.json();
			expect(body.details).toBeDefined();
		});

		it("creates an order successfully", async () => {
			mockedAuth.mockResolvedValue({
				user: { id: "user-1", role: "USER" },
			});

			const mockOrder = {
				id: "order-new",
				userId: "user-1",
				total: 19.98,
				status: "PENDING",
				items: [
					{
						id: "item-1",
						productId: "prod-1",
						quantity: 2,
						price: "9.99",
					},
				],
			};
			mockedPrisma.order.create.mockResolvedValue(mockOrder);

			const req = new Request("http://localhost/api/orders", {
				method: "POST",
				body: JSON.stringify({
					items: [
						{ productId: "prod-1", quantity: 2, price: "9.99" },
					],
				}),
			});

			const res = await POST(req);

			expect(res.status).toBe(201);
			const body = await res.json();
			expect(body).toEqual(mockOrder);

			expect(mockedPrisma.order.create).toHaveBeenCalledWith({
				data: {
					userId: "user-1",
					total: 19.98,
					items: {
						create: [{ productId: "prod-1", quantity: 2, price: 9.99 }],
					},
				},
				include: { items: { include: { product: true } } },
			});
		});
	});
});
