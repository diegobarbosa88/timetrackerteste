/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurar para exportación estática
  output: 'export',
  
  // Desactivar optimización de imágenes (necesario para exportación estática)
  images: {
    unoptimized: true,
  },
  
  // Ignorar errores de TypeScript durante la compilación
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Ignorar errores de ESLint durante la compilación
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Desactivar minificación para reducir problemas de compilación
  swcMinify: false,
  
  // Desactivar modo estricto de React para evitar problemas con hooks
  reactStrictMode: false,
  
  // Configuración experimental para mejorar compatibilidad
  experimental: {
    // Desactivar prerenderizado estático para evitar problemas con autenticación
    appDir: true,
    esmExternals: 'loose'
  }
}

module.exports = nextConfig
