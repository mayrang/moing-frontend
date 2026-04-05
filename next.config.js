const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

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
    // fallback: Route Handler가 없는 경로만 MSW Express(9090)로 프록시
    // (beforeFiles/afterFiles 는 동적 Route Handler보다 우선되어 401/404 발생)
    if (!apiBaseUrl || !apiBaseUrl.startsWith('http')) return [];
    return {
      fallback: [
        {
          source: '/api/:path*',
          destination: `${apiBaseUrl}/api/:path*`,
        },
      ],
    };
  },
};

module.exports = withBundleAnalyzer(nextConfig);
