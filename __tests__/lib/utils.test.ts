import {
	formatCurrency,
	formatDate,
	getStatusColor,
	formatOrderId,
	STATUS_COLORS,
} from "@/lib/utils";

describe("utils", () => {
	describe("formatCurrency", () => {
		it("formats a number as USD currency", () => {
			expect(formatCurrency(1999)).toBe("$1,999.00");
		});

		it("formats a string number as USD currency", () => {
			expect(formatCurrency("50.5")).toBe("$50.50");
		});

		it("formats zero", () => {
			expect(formatCurrency(0)).toBe("$0.00");
		});
	});

	describe("formatDate", () => {
		it("formats a Date object", () => {
			const d = new Date("2024-01-15T10:30:00Z");
			expect(formatDate(d)).toMatch(/January 15, 2024/);
		});

		it("formats an ISO date string", () => {
			expect(formatDate("2024-06-03T14:22:00Z")).toMatch(/June 3, 2024/);
		});
	});

	describe("getStatusColor", () => {
		it.each([
			["PENDING", STATUS_COLORS.PENDING],
			["PROCESSING", STATUS_COLORS.PROCESSING],
			["SHIPPED", STATUS_COLORS.SHIPPED],
			["DELIVERED", STATUS_COLORS.DELIVERED],
			["CANCELLED", STATUS_COLORS.CANCELLED],
		])("returns correct color class for %s", (status, expected) => {
			expect(getStatusColor(status)).toBe(expected);
		});

		it("returns default color for unknown status", () => {
			expect(getStatusColor("UNKNOWN")).toBe("bg-zinc-100 text-zinc-800");
		});
	});

	describe("formatOrderId", () => {
		it("returns first 8 chars uppercased", () => {
			expect(formatOrderId("abc123def456")).toBe("ABC123DE");
		});

		it("handles short ids", () => {
			expect(formatOrderId("abc")).toBe("ABC");
		});
	});
});
