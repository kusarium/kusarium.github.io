import { createCipheriv, pbkdf2Sync, randomBytes } from "node:crypto";

const dateFormatter = new Intl.DateTimeFormat("zh-TW", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const monthFormatter = new Intl.DateTimeFormat("zh-TW", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "long",
});

function topicSlug(value = "") {
  return Array.from(String(value).trim().toLowerCase())
    .map((character) => {
      if (/[a-z0-9]/.test(character)) return character;
      if (/[-_\s]/.test(character)) return "-";
      return `u${character.codePointAt(0).toString(16)}`;
    })
    .join("")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function xmlEscape(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function isBasementPost(item) {
  return item?.data?.section === "basement";
}

function addHeadingIds(value = "") {
  let index = 0;

  return String(value).replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (_match, level, attributes, inner) => {
    index += 1;
    const cleanAttributes = String(attributes).replace(/\s+id=(?:"[^"]*"|'[^']*')/gi, "");
    const id = `section-${String(index).padStart(2, "0")}`;
    return `<h${level}${cleanAttributes} id="${id}">${inner}</h${level}>`;
  });
}

function headingText(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, "")
    .replaceAll("&amp;", "&")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .trim();
}

function extractHeadings(value = "") {
  return [...String(value).matchAll(/<h([23])[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/gi)].map((match) => ({
    level: Number(match[1]),
    id: match[2],
    label: headingText(match[3]),
  }));
}

function encryptContent(value = "", password = "") {
  if (!password) return null;

  const iterations = 180000;
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = pbkdf2Sync(String(password), salt, iterations, 32, "sha256");
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(String(value), "utf8"),
    cipher.final(),
    cipher.getAuthTag(),
  ]);

  return {
    version: 1,
    algorithm: "AES-GCM",
    iterations,
    salt: salt.toString("base64"),
    iv: iv.toString("base64"),
    data: encrypted.toString("base64"),
  };
}

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({
    "node_modules/@fontsource-variable/noto-serif-tc": "assets/fonts/noto-serif-tc",
    "node_modules/@fontsource-variable/noto-sans-tc": "assets/fonts/noto-sans-tc",
    "node_modules/@fontsource-variable/noto-serif-sc": "assets/fonts/noto-serif-sc",
    "node_modules/@fontsource-variable/noto-sans-sc": "assets/fonts/noto-sans-sc",
    "node_modules/@fontsource-variable/noto-serif-jp": "assets/fonts/noto-serif-jp",
    "node_modules/@fontsource-variable/noto-sans-jp": "assets/fonts/noto-sans-jp",
  });
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");

  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/posts/*.md")
      .filter((item) => !item.data.draft && !isBasementPost(item))
      .sort((a, b) => b.date - a.date),
  );

  eleventyConfig.addCollection("basement", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/posts/*.md")
      .filter((item) => !item.data.draft && isBasementPost(item))
      .sort((a, b) => b.date - a.date),
  );

  eleventyConfig.addCollection("gallery", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/posts/*.md")
      .filter((item) => !item.data.draft && !isBasementPost(item) && item.data.cover)
      .sort((a, b) => b.date - a.date),
  );

  eleventyConfig.addCollection("topicList", (collectionApi) => {
    const topics = new Set();
    collectionApi.getFilteredByGlob("src/posts/*.md").forEach((item) => {
      if (item.data.draft || isBasementPost(item)) return;
      (item.data.topics || []).forEach((topic) => topics.add(topic));
    });
    return [...topics].sort((a, b) => a.localeCompare(b, "zh-TW"));
  });

  eleventyConfig.addFilter("dateReadable", (date) => dateFormatter.format(date));
  eleventyConfig.addFilter("dateIso", (date) => new Date(date).toISOString());
  eleventyConfig.addFilter("monthReadable", (date) => monthFormatter.format(date));
  eleventyConfig.addFilter("topicSlug", topicSlug);
  eleventyConfig.addFilter("xmlEscape", xmlEscape);
  eleventyConfig.addFilter("addHeadingIds", addHeadingIds);
  eleventyConfig.addFilter("extractHeadings", extractHeadings);
  eleventyConfig.addFilter("encryptContent", encryptContent);
  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));
  eleventyConfig.addFilter("take", (items, count) => (items || []).slice(0, count));
  eleventyConfig.addFilter("pad2", (value) => String(value).padStart(2, "0"));
  eleventyConfig.addFilter("filterByTopic", (items, topic) =>
    (items || []).filter((item) => (item.data.topics || []).includes(topic)),
  );
  eleventyConfig.addFilter("isActive", (currentUrl = "", targetUrl = "") => {
    if (typeof currentUrl !== "string" || typeof targetUrl !== "string") return false;
    if (targetUrl === "/") return currentUrl === "/";
    return currentUrl.startsWith(targetUrl);
  });
  eleventyConfig.addFilter("groupByYear", (items = []) => {
    const groups = new Map();
    items.forEach((item) => {
      const year = new Intl.DateTimeFormat("en", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
      }).format(item.date);
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year).push(item);
    });
    return [...groups].map(([year, posts]) => ({ year, posts }));
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
