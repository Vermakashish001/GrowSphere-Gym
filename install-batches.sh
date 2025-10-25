#!/bin/bash
set -e

echo "Installing dependencies in batches..."

# Batch 1: Core Next.js and React
echo "Batch 1: Core frameworks..."
npm install --no-save next@^15.5.4 react@^19.2.0 react-dom@^19.2.0

# Batch 2: Authentication & Database
echo "Batch 2: Auth and database..."
npm install --no-save next-auth@^4.24.11 @auth/prisma-adapter@^2.10.0 @prisma/client@^6.16.3 bcryptjs@^2.4.3

# Batch 3: UI Libraries
echo "Batch 3: UI libraries..."
npm install --no-save lucide-react@^0.544.0 @tanstack/react-table@^8.21.3 react-datepicker@^8.8.0

# Batch 4: Utilities
echo "Batch 4: Utilities..."
npm install --no-save imagekit@^6.0.0 nodemailer@^6.10.1 i18next@^25.5.3 react-i18next@^16.0.0

# Batch 5: Styling
echo "Batch 5: Styling..."
npm install --no-save tailwindcss@^4.1.14 @tailwindcss/postcss@^4.1.14 autoprefixer@^10.4.21 postcss@^8.5.6

# Batch 6: Dev dependencies
echo "Batch 6: Dev dependencies..."
npm install --save-dev typescript@^5.9.3 @types/node@^24.6.2 @types/react@^19.2.0 @types/react-dom@^19.2.0
npm install --save-dev @types/bcryptjs@^2.4.6 @types/react-datepicker@^6.2.0
npm install --save-dev eslint@^9.36.0 eslint-config-next@^15.5.4 prisma@^6.16.3

echo "All packages installed successfully!"
