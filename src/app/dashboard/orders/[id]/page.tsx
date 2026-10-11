import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";

export const instant = false;

async function getOrder(userId: string, orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}

function formatCurrency(amount: string | number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount));
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusColor(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "PROCESSING":
      return "bg-blue-100 text-blue-800";
    case "SHIPPED":
      return "bg-purple-100 text-purple-800";
    case "DELIVERED":
      return "bg-green-100 text-green-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-zinc-100 text-zinc-800";
  }
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/dashboard");
  }

  const { id } = await params;
  const order = await getOrder(session.user.id, id);

  if (!order) {
    notFound();
  }

  if (order.userId !== session.user.id) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col gap-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-zinc-500 hover:underline mb-2 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold">Order #{id.slice(0, 8).toUpperCase()}</h1>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
            order.status
          )}`}
        >
          {order.status}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-lg border border-zinc-200 p-6">
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

        <section className="rounded-lg border border-zinc-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Subtotal</dt>
              <dd>{formatCurrency(order.total.toString())}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Shipping</dt>
              <dd>Free</dd>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-3">
              <dt className="font-medium">Total</dt>
              <dd className="font-medium">{formatCurrency(order.total.toString())}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="rounded-lg border border-zinc-200">
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
                <h3 className="font-medium">{item.product?.name || "Product"}</h3>
                <p className="text-sm text-zinc-500">
                  Qty: {item.quantity} × {formatCurrency(item.price.toString())}
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