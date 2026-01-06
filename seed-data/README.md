# Shopify Seed Data

This folder contains scripts and data files to seed your Shopify store with test data using the Admin GraphQL API.

> **Note:** This is completely separate from Prisma/Supabase. It only interacts with Shopify's Admin API.

## Setup

### 1. Get Your Access Token

You need a Shopify Admin API access token. You can get this from:
- **Option A:** Your installed app's access token (stored in session)
- **Option B:** Create a Custom App in Shopify Admin:
  1. Go to Settings → Apps and sales channels → Develop apps
  2. Create an app
  3. Configure Admin API scopes (read/write products, customers, orders, etc.)
  4. Install the app and copy the Admin API access token

### 2. Set Environment Variables

Create or update your `.env` file:

```env
# Shopify Seed Configuration
SHOPIFY_SEED_STORE=your-store.myshopify.com
SHOPIFY_SEED_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxx
```

## Usage

```bash
# Seed all data (products, collections, customers)
npm run seed

# Seed only specific data
npm run seed:products
npm run seed:collections
npm run seed:customers
```

## Folder Structure

```
seed-data/
├── data/                    # JSON data files
│   ├── products.json
│   ├── collections.json
│   └── customers.json
├── seeders/                 # Seeder scripts
│   ├── products.ts
│   ├── collections.ts
│   ├── customers.ts
│   └── index.ts
├── utils/
│   └── shopify-client.ts    # Shopify API client
├── seed.ts                  # Main entry point
└── README.md
```

## Adding New Data

### Products
Edit `data/products.json` to add more products. Each product can have:
- `title`, `descriptionHtml`, `vendor`, `productType`
- `tags` - Array of tags
- `options` - Array of option names (e.g., ["Color", "Size"])
- `variants` - Array of variants with `price`, `sku`, `options`

### Collections
Edit `data/collections.json`. Collections can be:
- **Manual collections:** Set `ruleSet: null`
- **Smart collections:** Define rules with `column`, `relation`, `condition`

### Customers
Edit `data/customers.json`. Each customer has:
- `firstName`, `lastName`, `email`, `phone` (optional)
- `addresses` - Array of addresses
- `tags` - Array of tags
- `note` - Internal note

## Adding New Seeders

1. Create a new file in `seeders/` (e.g., `draft-orders.ts`)
2. Export the seeder function
3. Add export to `seeders/index.ts`
4. Update `seed.ts` to include the new seeder
5. Add a new script to `package.json`

## Rate Limits

The scripts include a 500ms delay between API calls to respect Shopify's rate limits.
Adjust `delay()` calls if needed for larger datasets.

