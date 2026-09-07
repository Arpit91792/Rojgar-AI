import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/sitemap.xml", async (req, res) => {
  try {
    const posts = await prisma.job.findMany({
      where: {
        status: "PUBLISHED",
      },
      select: {
        id: true,
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const baseUrl = "https://rozgargrid-ai.vercel.app";

    const urls = posts.map((post) => {
      const path = post.slug
        ? `/posts/${post.slug}`
        : `/posts/${post.id}`;

      return `
    <url>
      <loc>${baseUrl}${path}</loc>
      <lastmod>${new Date(post.updatedAt).toISOString()}</lastmod>
    </url>`;
    }).join("");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}/</loc>
    </url>
    ${urls}
</urlset>`;

    res.set("Content-Type", "application/xml");
    res.send(sitemap);

  } catch (error) {
    console.error("Sitemap error:", error);
    res.status(500).send("Unable to generate sitemap");
  }
});

export default router;