/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: process.env.NODE_ENV === 'production' ? '/Listen-Social' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/Listen-Social/' : '',
};

export default nextConfig;
