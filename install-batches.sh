#!/bin/bash
set -e

echo "Installing stable dependencies in batches..."

# Batch 1: Core Next.js and React (STABLE VERSIONS)
echo "Batch 1: Core frameworks..."
npm install --no-save next@14.2.18 react@^18.3.1 react-dom@^18.3.1

# Batch 2: Authentication & Database
echo "Batch 2: Auth and database..."
npm install --no-save next-auth@^4.24.11 @auth/prisma-adapter@^2.10.0 @prisma/client@^6.16.3 bcryptjs@^2.4.3

# Batch 3: UI Libraries
echo "Batch 3: UI libraries..."
npm install --no-save lucide-react@^0.544.0 @tanstack/react-table@^8.21.3 react-datepicker@^7.5.0

# Batch 4: Utilities
echo "Batch 4: Utilities..."
npm install --no-save imagekit@^6.0.0 nodemailer@^6.10.1 i18next@^25.5.3 react-i18next@^16.0.0

# Batch 5: Styling
echo "Batch 5: Styling..."
npm install --no-save tailwindcss@^4.1.14 @tailwindcss/postcss@^4.1.14 autoprefixer@^10.4.21 postcss@^8.5.6

# Batch 6: Dev dependencies
echo "Batch 6: Dev dependencies..."
npm install --save-dev typescript@^5.6.3 @types/node@^22.5.0 @types/react@^18.3.12 @types/react-dom@^18.3.1
npm install --save-dev @types/bcryptjs@^2.4.6 @types/react-datepicker@^6.2.0
npm install --save-dev eslint@^8.57.0 eslint-config-next@14.2.18 prisma@^6.16.3

echo "All stable packages installed successfully!"
