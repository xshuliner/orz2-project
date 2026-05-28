import { readFile, writeFile } from "node:fs/promises";

const siteUrl = "https://orz2.com";
const pages = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/products", changefreq: "weekly", priority: "0.9" },
  { path: "/team", changefreq: "monthly", priority: "0.7" },
  { path: "/privacy", changefreq: "monthly", priority: "0.6" },
];

const tools = JSON.parse(await readFile(new URL("../src/data/tools.json", import.meta.url), "utf8"));

const urls = [
  ...pages,
  ...tools.map((tool) => ({
    path: tool.href,
    changefreq: "weekly",
    priority: "0.8",
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${siteUrl}${url.path}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

await writeFile(new URL("../public/sitemap.xml", import.meta.url), xml);
