import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

const app = express();
const port = 4000;

app.use(cors({
  origin: 'http://localhost:3000'
}));
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'Shopdb'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL Database!');
});

// GET products
app.get('/products', (req, res) => {
  const query = 'SELECT * FROM products';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});

// POST a new product add a new product

app.post('/products', (req, res) => {
  console.log(req.body); // DEBUG: log body
  const { name, image, price, description } = req.body;
  if (!name || !image || !price || !description) {
    return res.status(400).json({ error: 'Missing fields in request body' });
  }
  const query = 'INSERT INTO products (name, image, price, description) VALUES (?, ?, ?, ?)';
  db.query(query, [name, image, price, description], (err, result: mysql.ResultSetHeader) => {
    if (err) {
      console.error('Error inserting product:', err);
      return res.status(500).json({ error: 'Database insert failed' });
    }
    res.status(201).json({
      message: 'Product added successfully',
      productId: result.insertId
    });
  });
});

// UPDATE a product by id
app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, image, price, description } = req.body;

  // Optionally, you can validate fields here
  if (!name || !image || !price || !description) {
    return res.status(400).json({ error: 'Missing fields in request body' });
  }

  const query = 'UPDATE products SET name = ?, image = ?, price = ?, description = ? WHERE id = ?';
  db.query(query, [name, image, price, description, id], (err, result: mysql.ResultSetHeader) => {
    if (err) {
      console.error('Error updating product:', err);
      return res.status(500).json({ error: 'Database update failed' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({
      message: 'Product updated successfully'
    });
  });
});

// DELETE a product by id
app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM products WHERE id = ?';
  db.query(query, [id], (err, result: mysql.ResultSetHeader) => {
    if (err) {
      console.error('Error deleting product:', err);
      return res.status(500).json({ error: 'Database delete failed' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({
      message: 'Product deleted successfully'
    });
  });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
