// Normal build: `npm run build` (server, optimized images).
// GitHub Pages: GITHUB_PAGES=true REPO_NAME=<repo> npm run build  -> static export in ./out
const pages = process.env.GITHUB_PAGES === "true";
const base = pages && process.env.REPO_NAME ? `/${process.env.REPO_NAME}` : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three"],
  images: { formats: ["image/avif", "image/webp"], unoptimized: pages },
  env: { NEXT_PUBLIC_BASE_PATH: base },
  ...(pages ? { output: "export", basePath: base, assetPrefix: base, trailingSlash: true } : {}),
};
export default nextConfig;
