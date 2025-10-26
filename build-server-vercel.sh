#!/bin/bash

echo "🚀 Building server for Vercel deployment..."

# Build the database package first
echo "📦 Building database package..."
cd packages/db
bun run build
cd ../..

# Build the server package
echo "📦 Building server package..."
cd apps/server
bun run build
cd ../..

# Copy the built files to the API directory
echo "📁 Copying built files..."
cp -r apps/server/dist/* apps/server/api/
cp -r packages/db/dist/* apps/server/api/

echo "✅ Server build complete for Vercel deployment!"
echo "📝 Next steps:"
echo "1. Install Vercel CLI: npm i -g vercel"
echo "2. Login to Vercel: vercel login"
echo "3. Deploy: vercel --prod"
