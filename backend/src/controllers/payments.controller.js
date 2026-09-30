import { prisma } from "../utils/prisma.js";

export async function listPayments(req, res) {
  const payments = await prisma.payment.findMany({
    include: { order: { select: { reference: true, fullName: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(payments);
}
