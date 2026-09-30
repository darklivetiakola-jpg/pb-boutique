import { prisma } from "../utils/prisma.js";

export async function listCustomers(req, res) {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    select: {
      id: true, firstName: true, lastName: true, email: true, phone: true, city: true, createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(customers);
}
