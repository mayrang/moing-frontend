/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  distDir: ".next",
  images: {
    domains: [], // 필요한 외부 이미지 도메인 추가
  },
  experimental: {
    scrollRestoration: true,
  },
  async rewrites() {
    const apiBaseUrl = process.env.API_BASE_URL;
    if (!apiBaseUrl) return [];
    return [
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
