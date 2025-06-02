const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname)));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/icons', express.static(path.join(__dirname, 'icons')));

// Mock API Routes (return sample data)
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    products: [
      {
        _id: '1',
        name: 'Adobe Photoshop CC',
        price: 19.99,
        category: 'software',
        image: '/img/photoshop-product.jpg',
        description: 'Professional photo editing software',
        stock: 100
      },
      {
        _id: '2',
        name: 'Wacom Intuos Pro',
        price: 299.99,
        category: 'digital art',
        image: '/img/wacom-tablet.jpg',
        description: 'Professional graphics tablet',
        stock: 25
      }
    ],
    pagination: { page: 1, limit: 12, total: 2, pages: 1 }
  });
});

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/:page.html', (req, res) => {
  res.sendFile(path.join(__dirname, `${req.params.page}.html`));
});

// Start server without MongoDB
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} (Standalone mode - No database)`);
  console.log(`Visit: http://localhost:${PORT}`);
}); 