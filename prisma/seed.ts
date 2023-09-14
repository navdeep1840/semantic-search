import prisma from "../lib/prisma";

import fs from "fs";
import { openai } from "../lib/openai";
// import { type Audits } from "@prisma/client";
import audit from "./tweets.reports_test.json";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("process.env.OPENAI_API_KEY is not defined. Please set it.");
}

// if (!process.env.POSTGRES_URL) {
//   throw new Error('process.env.POSTGRES_URL is not defined. Please set it.')
// }

async function main() {
  for (const record of audit as any) {
    const arr = [...record.lowRisk, ...record.highRisk, ...record.mediumRisk];

    for (const abc of arr as any) {
      const embedding = await generateEmbedding(abc.Name);

      const x = await prisma.audits.create({
        data: {
          reportLink: record.reportLink,
          reportSponsorLogo: record.reportSponsorLogo,
          publishedDate: record.publishedDate,

          name: abc.Name,
          link: abc.Link,

          contestName: record.contestName,
        },
      });

      // "prisma": {
      //   "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
      // },

      console.log(x);
      await prisma.$executeRaw`
          UPDATE reports_data
          SET embedding = ${embedding}::vector
          WHERE id = ${x.id}
      `;

      await new Promise((resolve) => setTimeout(resolve, 35000));
    }
  }

  console.log("Pokédex seeded successfully!");
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

async function generateEmbedding(_input: string) {
  const input = _input.replace(/\n/g, " ");
  const embeddingResponse = await openai.createEmbedding({
    model: "text-embedding-ada-002",
    input,
  });

  const embeddingData = await embeddingResponse.json();
  console.log(embeddingData);
  const [{ embedding }] = (embeddingData as any).data;
  return embedding;
}
