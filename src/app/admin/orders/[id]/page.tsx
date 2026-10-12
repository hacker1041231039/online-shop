"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
	formatCurrency,
	formatDate,
	getStatusColor,
	STATUS_OPTIONS,
	formatOrderId,
} from "@/lib/utils";
import type { OrderStatus } from "@/lib/utils";

interface Order {
  id: string;
  status: string;
  total: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    price: string;
    product: {
      id: string;
      name: string;
      image: string | null;
    } | null;
  }>;
}

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchOrder() {
    try {
      const { id } = await params;
      const response = await fetch(`/api/admin/orders/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch order");
      }
      const data = await response.json();
      setOrder(data);
    } catch (err) {
      setError("Failed to load order");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(newStatus: OrderStatus) {
    if (!order) return;

    setUpdating(true);
    setError(null);

    try {
      const { id } = await params;
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    } catch (err) {
      setError("Failed to update order status");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  }

  // Fetch order on mount
  if (typeof window !== "undefined") {
    fetchOrder();
  }

  if (loading) {
    return (
      <main className="flex flex-1 flex-col gap-6 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-zinc-200 rounded w-1/4"></div>
          <div className="h-64 bg-zinc-200 rounded"></div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="flex flex-1 flex-col gap-6 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-zinc-500 mt-2">{error || "Order not found"}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="text-sm text-zinc-500 hover:underline mb-2 inline-block"
          >
            ← Back to Orders
          </Link>
          <h1 className="text-2xl font-bold">
            Order #{formatOrderId(order.id)}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
              order.status
            )}`}
          >
            {order.status}
          </span>
          <select
            value={order.status}
            onChange={(e) => updateStatus(e.target.value as OrderStatus)}
            disabled={updating}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-700 text-sm">{error}</div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-lg border border-zinc-200 p-6 bg-white">
          <h2 className="text-lg font-semibold mb-4">Order Details</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Order Date</dt>
              <dd>{formatDate(order.createdAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Last Updated</dt>
              <dd>{formatDate(order.updatedAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Total Items</dt>
              <dd>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border border-zinc-200 p-6 bg-white">
          <h2 className="text-lg font-semibold mb-4">Customer</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Name</dt>
              <dd>{order.user.name || "N/A"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Email</dt>
              <dd>{order.user.email}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="rounded-lg border border-zinc-200 p-6 bg-white">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-zinc-500">Subtotal</dt>
            <dd>{formatCurrency(order.total)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500">Shipping</dt>
            <dd>Free</dd>
          </div>
          <div className="flex justify-between border-t border-zinc-200 pt-3">
            <dt className="font-medium">Total</dt>
            <dd className="font-medium">{formatCurrency(order.total)}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-lg font-semibold">Order Items</h2>
        </div>
        <div className="divide-y divide-zinc-200">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4">
              {item.product?.image && (
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h3 className="font-medium">
                  {item.product?.name || "Product"}
                </h3>
                <p className="text-sm text-zinc-500">
                  Qty: {item.quantity} × {formatCurrency(item.price)}
                </p>
              </div>
              <div className="font-medium">
                {formatCurrency(Number(item.price) * item.quantity)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}