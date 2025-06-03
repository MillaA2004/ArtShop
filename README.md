# Artsy Web Store - MongoDB Backend Integration

An e-commerce platform for art supplies and digital art tools, built with Node.js, Express.js, and MongoDB. This full-stack application provides a complete shopping experience with user authentication, cart management, and order processing.

## 🚀 Features

### Frontend
- Responsive web design for optimal viewing on all devices
- Interactive product catalog with filtering and sorting
- User authentication (login/register)
- Shopping cart functionality with real-time updates
- Secure checkout process

### Backend
- RESTful API built with Express.js
- MongoDB database with Mongoose ODM
- JWT-based authentication and authorization
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration for cross-origin requests
- Role-based access control (user/admin)

### Security
- Password encryption using bcrypt
- JWT token authentication
- Input validation and sanitization
- MongoDB injection prevention
- Secure CORS configuration

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Security**: bcrypt for password hashing
- **Validation**: express-validator

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## ⚡ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/MillaA2004/ArtShop.git
   cd ArtShop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/artsy-store
   
   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-change-this
   
   # Server Port
   PORT=5000
   
   # Frontend URL
   CLIENT_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas cloud database
   ```

5. **Run the application**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   
   Open your browser and navigate to `http://localhost:5000`

## 📊 Database Schema

### User Schema
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  fullName: String (required),
  address: {
    street: String,
    city: String,
    state: String,
    zip: String
  },
  cart: [{
    product: ObjectId (ref: Product),
    quantity: Number
  }],
  orders: [ObjectId (ref: Order)],
  role: String (user/admin),
  createdAt: Date
}
```

### Product Schema
```javascript
{
  name: String (required),
  description: String (required),
  price: Number (required),
  category: String (enum),
  subcategory: String,
  image: String (required),
  images: [String],
  stock: Number (required),
  features: [String],
  brand: String,
  tags: [String],
  rating: {
    average: Number,
    count: Number
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Schema
```javascript
{
  user: ObjectId (ref: User),
  orderNumber: String (unique),
  items: [{
    product: ObjectId (ref: Product),
    name: String,
    price: Number,
    quantity: Number,
    subtotal: Number
  }],
  billingAddress: Object,
  shippingAddress: Object,
  payment: {
    method: String,
    status: String,
    transactionId: String
  },
  subtotal: Number,
  tax: Number,
  shipping: Number,
  total: Number,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Endpoints

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Product Routes
- `GET /api/products` - List products with filtering and pagination
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Cart Routes
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update item quantity
- `DELETE /api/cart/remove/:productId` - Remove item
- `DELETE /api/cart/clear` - Clear entire cart
- `POST /api/cart/sync` - Sync guest cart with user account

### Order Routes
- `POST /api/orders/checkout` - Process checkout
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:orderId` - Get order details
- `PUT /api/orders/:orderId/cancel` - Cancel order

## 🔧 Development

### Seeding Sample Data
Create a seed script to populate the database with sample products:

```javascript
// seed.js
const Product = require('./models/Product');

const sampleProducts = [
  {
    name: 'Adobe Photoshop CC',
    description: 'Professional photo editing software',
    price: 19.99,
    category: 'software',
    image: '/img/photoshop-product.jpg',
    stock: 100
  },
  // Add more products...
];

// Run: node seed.js
```

### Testing API Endpoints
Use tools like Postman or Thunder Client to test API endpoints.

### Database Indexing
The system automatically creates indexes for:
- User email (unique)
- Product text search
- Order number (unique)

## 🚧 Future Enhancements

- **Payment Integration**: Integrate with Stripe or PayPal for secure payment processing
- **Email Notifications**: Order confirmation emails and password reset functionality
- **Image Upload**: Product image upload functionality and user avatar support
- **Reviews and Ratings**: Allow users to review products and calculate average ratings
- **Admin Dashboard**: Dedicated admin interface with sales analytics and inventory management

## 📝 License

This project is licensed under the ISC License.

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or need help with setup, please open an issue in the GitHub repository.

---

Made with ❤️ by [MillaA2004](https://github.com/MillaA2004)