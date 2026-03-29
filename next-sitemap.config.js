/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://innerzero.com",
  generateRobotsTxt: false,
  exclude: ["/account/*", "/api/*", "/login", "/register", "/forgot-password", "/reset-password", "/auth/*"],
};
