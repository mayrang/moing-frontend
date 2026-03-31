/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  distDir: ".next",
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: '125.242.221.180', port: '8080', pathname: '/**' },
      { protocol: 'https', hostname: '**', pathname: '/**' },
    ],
  },
  experimental: {
    scrollRestoration: true,
  },
  async rewrites() {
    const apiBaseUrl = process.env.API_BASE_URL;
    // 유효한 http(s) URL일 때만 프록시. 빈 문자열/공백/undefined는 Route Handler 사용
    if (!apiBaseUrl || !apiBaseUrl.startsWith('http')) return [];
    return [
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
