/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  
  // GitHub Pages serves from a subdirectory, so we need to set the base path
  // Replace 'qc-app' with your repository name
  basePath: process.env.NODE_ENV === 'production' ? '/qc-app' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/qc-app' : '',
  
  // Disable server-side features for static export
  trailingSlash: true,
  
  // Disable type checking during build (handle separately)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable ESLint during build (handle separately)
  eslint: {
    ignoreDuringBuilds: true,
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // Bundle optimization
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'framer-motion',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip'
    ],
  },
  // Image optimization - unoptimized for static export
  images: {
    unoptimized: true,
  },
  // Webpack optimization
  webpack: (config, { isServer }) => {
    // Optimize bundle splitting
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
}

module.exports = nextConfig