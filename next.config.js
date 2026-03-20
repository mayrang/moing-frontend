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
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_BASE_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
