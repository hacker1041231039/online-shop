export type OrderStatus =
	| "PENDING"
	| "PROCESSING"
	| "SHIPPED"
	| "DELIVERED"
	| "CANCELLED";

export const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
	{ value: "PENDING", label: "Pending" },
	{ value: "PROCESSING", label: "Processing" },
	{ value: "SHIPPED", label: "Shipped" },
	{ value: "DELIVERED", label: "Delivered" },
	{ value: "CANCELLED", label: "Cancelled" },
];

export const STATUS_COLORS: Record<OrderStatus, string> = {
	PENDING: "bg-yellow-100 text-yellow-800",
	PROCESSING: "bg-blue-100 text-blue-800",
	SHIPPED: "bg-purple-100 text-purple-800",
	DELIVERED: "bg-green-100 text-green-800",
	CANCELLED: "bg-red-100 text-red-800",
};

export function getStatusColor(status: string): string {
	return STATUS_COLORS[status as OrderStatus] ?? "bg-zinc-100 text-zinc-800";
}

export function formatCurrency(amount: number | string): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(Number(amount));
}

export function formatDate(date: Date | string): string {
	return new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function formatOrderId(id: string): string {
	return id.slice(0, 8).toUpperCase();
}
