/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'cdn.sanity.io',
          pathname: '/images/**',
        },
      ],
    },
    webpack: (config) => {
      config.externals = [...(config.externals || []), 'canvas', 'jsdom']
      return config
    },
  }
  
  export default nextConfig