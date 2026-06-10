import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { sectionForTopic } from "../src/sections";
import { SITE_URL as DEFAULT_SITE_URL } from "../src/seo/config";
import { TOPICS } from "../src/topics";

const SITE_URL = (process.env.VITE_SITE_URL ?? DEFAULT_SITE_URL).replace(/\/$/, "");

function topicPath(topicId: string): string {
  const section = sectionForTopic(topicId);
  return section ? `${section.path}/${topicId}` : `/algo/${topicId}`;
}

function loc(path: string): string {
  return `${SITE_URL}${path}`;
}

const staticPages = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/paths", priority: "0.8", changefreq: "monthly" },
  { path: "/compare", priority: "0.7", changefreq: "monthly" },
];

const topicPages = TOPICS.map((topic) => ({
  path: topicPath(topic.id),
  priority: "0.9",
  changefreq: "monthly",
}));

const urls = [...staticPages, ...topicPages];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ path, priority, changefreq }) => `  <url>
    <loc>${loc(path)}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

const outDir = join(import.meta.dir, "..", "public");
writeFileSync(join(outDir, "sitemap.xml"), xml);

const robots = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

writeFileSync(join(outDir, "robots.txt"), robots);

console.log(`generate-sitemap: wrote ${urls.length} URLs for ${SITE_URL}`);
