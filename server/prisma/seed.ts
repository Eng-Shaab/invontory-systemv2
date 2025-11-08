import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const MODEL_KEY_OVERRIDES: Record<string, keyof PrismaClient> = {
  users: "user",
};

async function deleteAllData(orderedFileNames: string[]) {
  const modelKeys = orderedFileNames.map((fileName) => {
    const baseName = path.basename(fileName, path.extname(fileName));
    return (MODEL_KEY_OVERRIDES[baseName] ?? baseName) as keyof PrismaClient;
  });

  for (const modelKey of modelKeys) {
    const model = prisma[modelKey] as any;
    if (model) {
      await model.deleteMany({});
      console.log(`Cleared data from ${String(modelKey)}`);
    } else {
      console.error(`Model ${String(modelKey)} not found. Please ensure the model name is correctly specified.`);
    }
  }
}

async function main() {
  const dataDirectory = path.join(__dirname, "seedData");

  const orderedFileNames = [
    "users.json",
    "products.json", // parent
    "customers.json", // parent
    "purchases.json", // child (related to products)
    "sales.json", // child (related to products & customers)
    "inventorySummary.json", // summary
    "salesSummary.json", // summary
    "customerSummary.json",
  ];

  await deleteAllData(orderedFileNames);

  await prisma.session.deleteMany({})
  await prisma.twoFactorToken.deleteMany({})

  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const baseName = path.basename(fileName, path.extname(fileName));
    const modelKey = (MODEL_KEY_OVERRIDES[baseName] ?? baseName) as keyof PrismaClient;
  const model = prisma[modelKey] as any;

    if (!model) {
      console.error(`No Prisma model matches the file name: ${fileName}`);
      continue;
    }

    for (const rawData of jsonData) {
      if (baseName === "users") {
        const { password, ...rest } = rawData as { password: string } & Record<string, unknown>;
        const passwordHash = await bcrypt.hash(password, 10);
        await prisma.user.create({
          data: {
            ...(rest as Record<string, unknown>),
            passwordHash,
          } as any,
        });
        continue;
      }

      await model.create({
        data: rawData as any,
      });
    }

    console.log(`Seeded ${baseName} with data from ${fileName}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });