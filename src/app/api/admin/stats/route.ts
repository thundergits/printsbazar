import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";

export async function GET() {
  if (!await getAdminSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [totalOrders, totalProducts, totalRevenue, recentOrders, ordersByStatus] =
    await Promise.all([
      prisma.order.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "paid" } }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { items: { take: 1 } },
      }),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);

  return NextResponse.json({
    totalOrders,
    totalProducts,
    totalRevenue: totalRevenue._sum.total ?? 0,
    recentOrders,
    ordersByStatus,
  });
}
