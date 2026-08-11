export default {
  layout: "layouts/post.njk",
  eleventyComputed: {
    permalink: (data) => {
      if (data.draft) return false;
      const section = data.section === "basement" ? "basement" : "journal";
      return `/${section}/${data.page.fileSlug}/index.html`;
    },
    eleventyExcludeFromCollections: (data) => Boolean(data.draft),
    noindex: (data) => data.section === "basement",
    excludeFromSitemap: (data) => data.section === "basement",
  },
};
