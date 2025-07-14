/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
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