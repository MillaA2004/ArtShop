# Artsy Web Store - MongoDB Backend Integration

This project is an e-commerce platform for art supplies and digital art tools, now integrated with a MongoDB backend using Node.js and Express.

## 🚀 Backend Integration Steps Taken

### 1. **Project Initialization**
- Created `package.json` with all necessary dependencies:
  - Express.js for the web server
  - Mongoose for MongoDB ODM
  - JWT for authentication
  - Bcrypt for password hashing
  - Express-validator for input validation
  - CORS for cross-origin requests

### 2. **Server Setup (`server.js`)**
- Created Express server with middleware configuration
- Set up MongoDB connection using Mongoose
- Configured static file serving for the existing frontend
- Defined API routes for authentication, products, cart, and orders
- Added error handling middleware

### 3. **Database Models**
Created three main MongoDB schemas:

#### User Model (`models/User.js`)
- Email and password authentication
- User profile information (name, address)
- Shopping cart embedded as subdocument
- Password hashing using bcrypt
- Role-based access (user/admin)

#### Product Model (`models/Product.js`)
- Product details (name, description, price)
- Category and subcategory classification
- Stock management
- Image URLs
- Rating system
- Text search indexes for product search

#### Order Model (`models/Order.js`)
- Order items with product references
- Billing and shipping addresses
- Payment information
- Order status tracking
- Automatic order number generation
- Tax and shipping calculation

### 4. **Authentication System**
- JWT-based authentication middleware (`middleware/auth.js`)
- Token generation and verification
- Protected route handling
- Admin access control

### 5. **API Routes Implementation**

#### Authentication Routes (`routes/auth.js`)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

#### Product Routes (`routes/products.js`)
- `GET /api/products` - List products with filtering and pagination
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

#### Cart Routes (`routes/cart.js`)
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update item quantity
- `DELETE /api/cart/remove/:productId` - Remove item
- `DELETE /api/cart/clear` - Clear entire cart
- `POST /api/cart/sync` - Sync guest cart with user account

#### Order Routes (`routes/orders.js`)
- `POST /api/orders/checkout` - Process checkout
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:orderId` - Get order details
- `PUT /api/orders/:orderId/cancel` - Cancel order
- Admin routes for order management

### 6. **Frontend Integration**
Updated JavaScript files to communicate with the backend:

#### Authentication (`js/auth.js`)
- Login/Register forms connect to backend API
- JWT token storage in localStorage
- Cart synchronization on login
- Form validation and error handling

#### Product Display (`js/index.js`)
- Fetches products from API
- Handles authenticated vs guest cart operations
- Updates cart count dynamically
- Product filtering and sorting

#### Shopping Cart (`js/cart.js`)
- Loads cart from API for authenticated users
- Falls back to localStorage for guests
- Real-time quantity updates
- Checkout process with order creation

## 📋 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd WebDesign_New
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

5. **Run the server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:5000`

## 🗄️ Database Schema

### Users Collection
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

### Products Collection
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

### Orders Collection
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

## 🔐 Security Features

1. **Password Security**
   - Passwords are hashed using bcrypt with salt rounds
   - Password strength validation (min 6 characters)

2. **JWT Authentication**
   - Tokens expire after 7 days
   - Secure token storage in localStorage
   - Authorization headers for API requests

3. **Input Validation**
   - Server-side validation using express-validator
   - Sanitization of user inputs
   - MongoDB injection prevention

4. **CORS Configuration**
   - Configured for specific origins
   - Credentials support enabled

## 🛠️ Development Tips

1. **Seeding Sample Data**
   Create a seed script to populate the database:
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

2. **Testing API Endpoints**
   Use tools like Postman or Thunder Client to test API endpoints

3. **MongoDB Indexing**
   The system automatically creates indexes for:
   - User email (unique)
   - Product text search
   - Order number (unique)

## 🚧 Future Enhancements

1. **Payment Integration**
   - Integrate with Stripe or PayPal
   - Secure payment processing

2. **Email Notifications**
   - Order confirmation emails
   - Password reset functionality

3. **Image Upload**
   - Product image upload functionality
   - User avatar support

4. **Reviews and Ratings**
   - Allow users to review products
   - Calculate average ratings

5. **Admin Dashboard**
   - Dedicated admin interface
   - Sales analytics
   - Inventory management

## 📝 License

This project is licensed under the ISC License.
