/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use static export for production builds
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',
    trailingSlash: true,
    distDir: 'out',
    assetPrefix: './',
  }),
  images: {
    unoptimized: true,
  },
  swcMinify: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.target = 'electron-renderer';
      
      // Fix global is not defined error
      config.resolve.fallback = {
        ...config.resolve.fallback,
        global: false,
        buffer: false,
        process: false,
        fs: false,
        path: false,
      };
      
      // Add global polyfill
      config.plugins = config.plugins || [];
      config.plugins.push(
        new (require('webpack').ProvidePlugin)({
          global: 'globalThis',
        })
      );
      
      // Add DefinePlugin for Node.js globals
      config.plugins.push(
        new (require('webpack').DefinePlugin)({
          __dirname: JSON.stringify('/'),
          __filename: JSON.stringify('/index.js'),
        })
      );
    }
    return config;
  },
}

module.exports = nextConfig 