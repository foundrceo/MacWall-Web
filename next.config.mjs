/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.apple.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "YOUR_SUPABASE_PROJECT_REF.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
}

export default nextConfig
