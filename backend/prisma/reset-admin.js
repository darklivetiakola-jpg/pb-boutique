import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage : node prisma/reset-admin.js <email> <nouveau-mot-de-passe>");
  process.exit(1);
}
if (password.length < 8) {
  console.error("Le mot de passe doit faire au moins 8 caractères.");
  process.exit(1);
}

async function main() {
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN" },
    create: { email, passwordHash, firstName: "Admin", lastName: "PB", role: "ADMIN" },
  });
  console.log(`OK — mot de passe réinitialisé pour ${user.email} (role: ${user.role})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
