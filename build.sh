#!/bin/bash
set -e

echo "📦 Generating Prisma client..."
npx prisma generate

echo "🔨 Compiling TypeScript..."
npx tsc

echo "✅ Build complete!"
