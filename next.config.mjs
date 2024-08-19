/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // or 'default'
  // basePath: '', // Remove this line if deploying at the root
  // assetPrefix: '', // Remove this line if deploying at the root
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('puppeteer');
    }
    return config;
  },
};

export default nextConfig;