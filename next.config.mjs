/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  pageExtensions: ['ts', 'tsx', 'mdx'],
  serverExternalPackages: ['next-mdx-remote', 'shiki', 'gray-matter', 'reading-time'],
};
export default nextConfig;
