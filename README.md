# Product Pagination API

A backend API that lets you browse 200,000 products with fast, 
reliable pagination — even when new products are being added live.

## The Problem I Solved

Most pagination uses OFFSET — like "skip 1000 rows, give me the next 20."
This breaks when new products are added while someone is browsing,
because rows shift and the user sees duplicates or misses products.

## My Solution

I used cursor-based pagination.
Instead of "skip 1000 rows", I say "give me products older than this exact product."
Even if 100 new products are added, your position never shifts.
Think of it like a bookmark — it always points to the exact same place.

## Tech Stack

- Node.js + Express (API)
- PostgreSQL on Neon (database)
- Deployed on Render (free hosting)

## How to Use

**Get first page:**
GET /api/products?limit=20

**Get next page (paste cursor from previous response):**
GET /api/products?limit=20&cursor=YOUR_CURSOR_HERE

**Filter by category:**
GET /api/products?limit=20&category=Electronics

**Available categories:**
Electronics, Clothing, Books, Home, Sports, Toys, Food, Beauty

## How Cursor Works

1. You request page 1 → API returns 20 products + a next_cursor
2. You send next_cursor back → API returns next 20 products
3. The server never stores your session — you hold the cursor
4. No duplicates, no missing products, works forever

## Database Design

- 200,000 products seeded in batches of 5,000 (fast bulk insert)
- Composite index on (created_at, id) — keeps queries fast on deep pages
- Index on category — keeps filtering fast

## What I Would Improve With More Time

- Add search by product name
- Add price range filter
- Add rate limiting so API doesn't get abused
- Write automated tests for pagination correctness
- Move to UUID instead of serial ID for production safety

## How I Used AI

- Used Claude AI to understand cursor pagination concept
- Wrote and understood every line of code myself
- AI helped me debug the .env connection issue
- All logic and architecture decisions were mine
