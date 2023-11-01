export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/private/", "/api/", "/auth/"],
    },
    sitemap: "https://www.labelguardapp.com/sitemap.xml",
  };
}
