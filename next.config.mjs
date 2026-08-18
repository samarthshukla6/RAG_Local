/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  serverExternalPackages: ["pdf-parse", "tesseract.js", "@langchain/ollama"],
};

export default nextConfig;
