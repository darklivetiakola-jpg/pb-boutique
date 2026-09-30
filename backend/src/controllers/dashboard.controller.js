import { prisma } from "../utils/prisma.js";

export async function getStats(req, res) {
  const days = Number(req.query.days || 30);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const paidStatuses = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

  const [revenueAgg, ordersCount, pendingCount, recentOrders, allProducts] = await Promise.all([
    prisma.order.aggregate({ where: { status: { in: paidStatuses } }, _sum: { totalAmount: true } }),
    prisma.order.count({ where: { status: { in: paidStatuses } } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({
      where: { status: { in: paidStatuses }, createdAt: { gte: since } },
      include: { items: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.product.findMany({ include: { variants: true } }),
  ]);

  const revenueTotal = revenueAgg._sum.totalAmount || 0;
  const avgBasket = ordersCount ? Math.round(revenueTotal / ordersCount) : 0;

  // Évolution par jour (rempli les jours sans vente à 0 pour un graphique continu)
  const byDay = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    byDay[d.toISOString().slice(0, 10)] = { day: d.toISOString().slice(0, 10), total: 0, count: 0 };
  }
  recentOrders.forEach(o => {
    const key = o.createdAt.toISOString().slice(0, 10);
    if (byDay[key]) { byDay[key].total += o.totalAmount; byDay[key].count += 1; }
  });
  const revenueByDay = Object.values(byDay).sort((a, b) => a.day.localeCompare(b.day));

  // Top produits
  const salesByProduct = {};
  recentOrders.forEach(o => o.items.forEach(i => {
    salesByProduct[i.productName] ??= { productName: i.productName, quantitySold: 0, revenue: 0 };
    salesByProduct[i.productName].quantitySold += i.quantity;
    salesByProduct[i.productName].revenue += i.unitPrice * i.quantity;
  }));
  const topProducts = Object.values(salesByProduct).sort((a, b) => b.quantitySold - a.quantitySold).slice(0, 5);

  const lowStock = allProducts.flatMap(p =>
    p.variants.filter(v => v.stock <= v.lowStockThreshold)
      .map(v => ({ product: p.name, size: v.size, color: v.color, stock: v.stock }))
  );

  res.json({
    revenueTotal, ordersCount, averageBasket: avgBasket, pendingOrders: pendingCount,
    revenueByDay, topProducts, lowStockAlerts: lowStock,
    productsCount: allProducts.length,
  });
}
