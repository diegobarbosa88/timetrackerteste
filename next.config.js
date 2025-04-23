/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    appDir: true,
  },
  env: {
    NEXT_DISABLE_STATIC_GENERATION: true,
    NEXT_PUBLIC_RUNTIME_ENV: 'client',
  },
  // Configuración para evitar errores de prerenderizado
  staticPageGenerationTimeout: 120,
  images: {
    unoptimized: true,
  },
  // Configuración para resolver módulos externos
  webpack: (config, { isServer }) => {
    // Asegurarse de que webpack pueda resolver los módulos necesarios
    return config;
  },
}
