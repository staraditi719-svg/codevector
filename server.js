const express = require('express');
const pool = require('./db');

const app = express();
app.use(express.json());

app.get('/api/products', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category || null;
    const cursor = req.query.cursor || null;

    let cursorId = null;
    let cursorDate = null;

    if (cursor) {
      const decoded = Buffer.from(cursor, 'base64').toString('utf8');
      const parsed = JSON.parse(decoded);
      cursorId = parsed.id;
      cursorDate = parsed.created_at;
    }

    let query;
    let params;

    if (!cursor && !category) {
      query = `SELECT * FROM products ORDER BY created_at DESC, id DESC LIMIT $1`;
      params = [limit];

    } else if (!cursor && category) {
      query = `SELECT * FROM products WHERE category = $1 ORDER BY created_at DESC, id DESC LIMIT $2`;
      params = [category, limit];

    } else if (cursor && !category) {
      query = `SELECT * FROM products 
               WHERE (created_at, id) < ($1, $2)
               ORDER BY created_at DESC, id DESC LIMIT $3`;
      params = [cursorDate, cursorId, limit];

    } else {
      query = `SELECT * FROM products 
               WHERE category = $1 AND (created_at, id) < ($2, $3)
               ORDER BY created_at DESC, id DESC LIMIT $4`;
      params = [category, cursorDate, cursorId, limit];
    }

    const result = await pool.query(query, params);
    const products = result.rows;

    let nextCursor = null;
    if (products.length === limit) {
      const last = products[products.length - 1];
      nextCursor = Buffer.from(JSON.stringify({
        id: last.id,
        created_at: last.created_at
      })).toString('base64');
    }

    res.json({
      data: products,
      next_cursor: nextCursor,
      count: products.length
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
