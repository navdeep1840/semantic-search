"use server";

import prisma from "@/lib/prisma";
import { openai } from "@/lib/openai";
import { type Audits } from "@prisma/client";
import { ratelimit } from "@/lib/utils";

export async function searchPokedex(
  query: string
): Promise<Array<Audits & { similarity: number }>> {
  try {
    if (query.trim().length === 0) return [];

    // const { success } = await ratelimit.limit("generations");
    // if (!success) throw new Error("Rate limit exceeded");

    const embedding = await generateEmbedding(query);

    const vectorQuery = `[${embedding.join(",")}]`;

    console.log("🚀 ~ file: actions.tsx:21 ~ vectorQuery:", vectorQuery);
    // const pokemon = await prisma.$queryRaw`
    //   SELECT
    //     id,
    //     "name",
    //     1 - (embedding <=> ${vectorQuery}::vector) as similarity
    //   FROM pokemon
    //   where 1 - (embedding <=> ${vectorQuery}::vector) > .5
    //   ORDER BY  similarity DESC
    //   LIMIT 8;
    // `;

    const pokemon = await prisma.$queryRaw`
      SELECT
     id,
    "name",
     1 - (embedding <=> ${vectorQuery}::vector) as similarity
      FROM reports_data
       where 1 - (embedding <=> ${vectorQuery}::vector) > .6
       ORDER BY  similarity DESC
      LIMIT 2;
    `;

    console.log(pokemon, `searched values`);

    return pokemon as Array<Audits & { similarity: number }>;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function generateEmbedding(raw: string) {
  // OpenAI recommends replacing newlines with spaces for best results
  const input = raw.replace(/\n/g, " ");
  const embeddingResponse = await openai.createEmbedding({
    model: "text-embedding-ada-002",
    input,
  });

  const embeddingData = await embeddingResponse.json();
  console.log(
    "🚀 ~ file: actions.tsx:60 ~ generateEmbedding ~ embeddingData:",
    embeddingData
  );
  const [{ embedding }] = (embeddingData as any).data;
  return embedding;
}
