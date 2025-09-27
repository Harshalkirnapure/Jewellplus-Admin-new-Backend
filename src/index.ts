import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
  origin: 'http://localhost:3000'
}));
app.use(express.json());

// Create a PostgreSQL connection pool
const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'Shopdb',
  port: 5432,
  ssl: { rejectUnauthorized: false }  // needed for Render PostgreSQL
});

// GET products
app.get('/products', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// POST a new product
app.post('/products', async (req, res) => {
  const { name, image, price, description } = req.body;
  if (!name || !image || !price || !description) {
    return res.status(400).json({ error: 'Missing fields in request body' });
  }

  try {
    const result = await db.query(
      'INSERT INTO products (name, image, price, description) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, image, price, description]
    );
    res.status(201).json({
      message: 'Product added successfully',
      productId: result.rows[0].id
    });
  } catch (err) {
    console.error('Error inserting product:', err);
    res.status(500).json({ error: 'Database insert failed' });
  }
});

// UPDATE a product by id
app.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, image, price, description } = req.body;

  if (!name || !image || !price || !description) {
    return res.status(400).json({ error: 'Missing fields in request body' });
  }

  try {
    const result = await db.query(
      'UPDATE products SET name = $1, image = $2, price = $3, description = $4 WHERE id = $5',
      [name, image, price, description, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Database update failed' });
  }
});

// DELETE a product by id
app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM products WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Database delete failed' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
