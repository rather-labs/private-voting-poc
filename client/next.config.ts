import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@aztec/bb.js",
    //"@noir-lang/noir_js",
    //"@noir-lang/noir_wasm",
    //"@noir-lang/types"
  ],
  outputFileTracingIncludes: {
    // Adjust the path ("/api" or "/" depending on where you import bb.js)
    '/server': [
      'node_modules/@aztec/bb.js/dest/node/barretenberg_wasm/**/*',
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  //webpack: (config) => {
  //    config.resolve.fallback = { 
  //      fs: false,
  //      path: false,
  //      crypto: false,
  //    };
  //
  //    config.resolve.mainFields = ['browser', 'module', 'main'];
  //
  //    // Properly support WASM
  //    config.module.rules.push({
  //      test: /\.wasm$/,
  //      type: "asset/resource",
  //    });
  //    
  //    // Support for top-level await
  //    config.experiments = {
  //      asyncWebAssembly: true,
  //      syncWebAssembly: true,
  //      topLevelAwait: true,
  //      layers: true,
  //    };
  //    
  //    return config;
  //  },
};
export default nextConfig;
