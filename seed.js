const pool = require('./db');

const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Toys', 'Food', 'Beauty'];

async function createTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_products_cursor 
    ON products (created_at DESC, id DESC)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_products_category 
    ON products (category)
  `);

  console.log('Table and indexes created!');
}

async function seedProducts() {
  await createTable();

  const batchSize = 5000;
  const totalProducts = 200000;
  const batches = totalProducts / batchSize;

  console.log('Starting to insert 200,000 products...');

  for (let b = 0; b < batches; b++) {
    const values = [];
    const placeholders = [];

    for (let i = 0; i < batchSize; i++) {
      const index = b * batchSize + i;
      const category = categories[index % categories.length];
      const name = `Product_${index + 1}`;
      const price = (Math.random() * 990 + 10).toFixed(2);
      const date = new Date(Date.now() - index * 1000);

      const pos = i * 4;
      placeholders.push(`($${pos+1}, $${pos+2}, $${pos+3}, $${pos+4})`);
      values.push(name, category, price, date);
    }

    await pool.query(
      `INSERT INTO products (name, category, price, created_at) VALUES ${placeholders.join(',')}`,
      values
    );

    console.log(`Inserted batch ${b + 1}/${batches}`);
  }

  console.log('Done! 200,000 products inserted.');
  process.exit(0);
}

seedProducts().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});