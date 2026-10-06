import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = ["Chemises", "Tee-shirts", "Polos", "Costumes", "Pantalons", "Accessoires"];

const PRODUCTS = [
  { name: "Polo Piqué Signature PB", category: "Polos", material: "Coton peigné", price: 28000, compare: 40000, featured: true },
  { name: "Chemise Lin Sablé", category: "Chemises", material: "Lin & coton", price: 42000, compare: null, featured: false },
  { name: "Blazer Bogolan", category: "Costumes", material: "Laine mélangée", price: 89000, compare: null, featured: true },
  { name: "Pantalon Chino Ardoise", category: "Pantalons", material: "Coton stretch", price: 35000, compare: null, featured: false },
  { name: "Manteau Laine Cognac", category: "Costumes", material: "Laine vierge", price: 125000, compare: null, featured: false },
  { name: "Ceinture Cuir Pleine Fleur", category: "Accessoires", material: "Cuir pleine fleur", price: 22000, compare: 28000, featured: false },
];

function slugify(str) {
  return str.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
}

async function main() {
  const categoryMap = {};
  for (const name of CATEGORIES) {
    const cat = await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) },
    });
    categoryMap[name] = cat.id;
  }

  for (const p of PRODUCTS) {
    const slug = slugify(p.name);
    const exists = await prisma.product.findUnique({ where: { slug } });
    if (exists) continue;

    const product = await prisma.product.create({
      data: {
        name: p.name, slug, categoryId: categoryMap[p.category],
        material: p.material, basePrice: p.price, compareAtPrice: p.compare,
        isFeatured: p.featured, status: "PUBLISHED",
        description: `${p.name} — pièce ${p.material.toLowerCase()}, coupée pour un tombé net.`,
      },
    });
    for (const size of ["S", "M", "L", "XL"]) {
      await prisma.productVariant.create({
        data: { productId: product.id, size, color: "Standard", sku: `${slug}-${size}`.toUpperCase(), stock: 12 },
      });
    }
  }

  const adminEmail = "admin@pbboutique.ci";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash("ChangeMoi123!", 12),
        firstName: "Admin", lastName: "PB", role: "ADMIN",
      },
    });
    console.log(`Compte admin créé : ${adminEmail} / ChangeMoi123! (À CHANGER après la première connexion)`);
  }

  console.log("Seed terminé.");
}

main().finally(() => prisma.$disconnect());
