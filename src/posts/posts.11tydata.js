export default {
  layout: "layouts/post.njk",
  eleventyComputed: {
    permalink: (data) => (data.draft ? false : `/journal/${data.page.fileSlug}/index.html`),
    eleventyExcludeFromCollections: (data) => Boolean(data.draft),
  },
};
