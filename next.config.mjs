/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  serverExternalPackages: ["pdf-parse", "tesseract.js"],
  outputFileTracingIncludes: {
    "/api/ragchat": [
      "./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
      "./node_modules/tesseract.js-core/**/*.wasm",
    ],
  },
};

export default nextConfig;
