const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const monthFormatter = new Intl.DateTimeFormat("zh-CN", {
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

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");

  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/posts/*.md")
      .filter((item) => !item.data.draft)
      .sort((a, b) => b.date - a.date),
  );

  eleventyConfig.addCollection("gallery", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/posts/*.md")
      .filter((item) => !item.data.draft && item.data.cover)
      .sort((a, b) => b.date - a.date),
  );

  eleventyConfig.addCollection("topicList", (collectionApi) => {
    const topics = new Set();
    collectionApi.getFilteredByGlob("src/posts/*.md").forEach((item) => {
      if (item.data.draft) return;
      (item.data.topics || []).forEach((topic) => topics.add(topic));
    });
    return [...topics].sort((a, b) => a.localeCompare(b, "zh-CN"));
  });

  eleventyConfig.addFilter("dateReadable", (date) => dateFormatter.format(date));
  eleventyConfig.addFilter("dateIso", (date) => new Date(date).toISOString());
  eleventyConfig.addFilter("monthReadable", (date) => monthFormatter.format(date));
  eleventyConfig.addFilter("topicSlug", topicSlug);
  eleventyConfig.addFilter("xmlEscape", xmlEscape);
  eleventyConfig.addFilter("take", (items, count) => (items || []).slice(0, count));
  eleventyConfig.addFilter("pad2", (value) => String(value).padStart(2, "0"));
  eleventyConfig.addFilter("filterByTopic", (items, topic) =>
    (items || []).filter((item) => (item.data.topics || []).includes(topic)),
  );
  eleventyConfig.addFilter("isActive", (currentUrl = "", targetUrl = "") => {
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
