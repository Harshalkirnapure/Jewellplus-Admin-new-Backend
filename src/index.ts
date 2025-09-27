import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
  origin: 'http://localhost:3000'
}));
app.use(express.json());

// Create a connection to the database using `mysql2/promise`
const db = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'root',
  database: process.env.DB_NAME || 'Shopdb'
});

console.log('Connected to MySQL Database!');

// GET products
app.get('/products', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM products');
    res.json(results);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// POST a new product
app.post('/products', async (req, res) => {
  console.log(req.body); // DEBUG: log body
  const { name, image, price, description } = req.body;
  if (!name || !image || !price || !description) {
    return res.status(400).json({ error: 'Missing fields in request body' });
  }
  const query = 'INSERT INTO products (name, image, price, description) VALUES (?, ?, ?, ?)';
  try {
    const [result] = await db.query(query, [name, image, price, description]);
    res.status(201).json({
      message: 'Product added successfully',
      productId: result.insertId
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

  // Optionally, you can validate fields here
  if (!name || !image || !price || !description) {
    return res.status(400).json({ error: 'Missing fields in request body' });
  }

  const query = 'UPDATE products SET name = ?, image = ?, price = ?, description = ? WHERE id = ?';
  try {
    const [result] = await db.query(query, [name, image, price, description, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({
      message: 'Product updated successfully'
    });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Database update failed' });
  }
});

// DELETE a product by id
app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM products WHERE id = ?';
  try {
    const [result] = await db.query(query, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({
      message: 'Product deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Database delete failed' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
