// API Base URL
const API_URL = 'http://localhost:5000/api';

// Get auth token
function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Check if user is authenticated
function isAuthenticated() {
  return !!getAuthToken();
}

// Sample products data (will be replaced by API data)
let products = [];

// Fetch products from API
async function fetchProducts() {
  try {
    const categoryFilter = document.getElementById('category')?.value || 'all';
    const sortBy = document.getElementById('sort')?.value || 'name';
    
    const queryParams = new URLSearchParams({
      category: categoryFilter !== 'all' ? categoryFilter : '',
      sort: sortBy,
      order: 'asc',
      limit: 20
    });
    
    const response = await fetch(`${API_URL}/products?${queryParams}`);
    const data = await response.json();
    
    if (data.success) {
      products = data.products;
      displayProducts(products);
    } else {
      console.error('Failed to fetch products');
      // Display fallback message
      document.getElementById('product-list').innerHTML = '<p>Failed to load products. Please try again later.</p>';
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    // Use sample data as fallback
    loadSampleProducts();
  }
}

// Display products
function displayProducts(productsToShow) {
  const productList = document.getElementById('product-list');
  productList.innerHTML = '';
  
  if (productsToShow.length === 0) {
    productList.innerHTML = '<p class="no-products">No products found.</p>';
    return;
  }
  
  productsToShow.forEach(product => {
    const productElement = document.createElement('div');
    productElement.className = 'product';
    
    // Handle free products
    const priceDisplay = product.price === 0 ? 'Free' : `$${product.price.toFixed(2)}`;
    
    productElement.innerHTML = `
      <img src="${product.image}" alt="${product.name}" onerror="this.src='img/placeholder.jpg'">
      <h3>${product.name}</h3>
      <p class="description">${product.description || ''}</p>
      <p class="price">${priceDisplay}</p>
      <button onclick="addToCart('${product._id}')" class="add-to-cart">Add to Cart</button>
    `;
    productList.appendChild(productElement);
  });
}

// Add product to cart
async function addToCart(productId) {
  const product = products.find(p => p._id === productId);
  if (!product) return;
  
  if (isAuthenticated()) {
    // Add to cart via API
    try {
      const response = await fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1
        })
      });
      
      const data = await response.json();
      if (data.success) {
        showToast('Product added to cart!');
        updateCartCount();
      } else {
        showToast(data.message || 'Failed to add product to cart', 'error');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Network error. Please try again.', 'error');
    }
  } else {
    // Add to local storage cart
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    showToast('Product added to cart! Please login to save your cart.');
    updateCartCount();
  }
}

// Update cart count in navigation
async function updateCartCount() {
  let count = 0;
  
  if (isAuthenticated()) {
    try {
      const response = await fetch(`${API_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        count = data.itemCount || 0;
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  } else {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    count = cart.reduce((sum, item) => sum + item.quantity, 0);
  }
  
  // Update cart icon with count
  const cartIcon = document.querySelector('.fa-shopping-cart');
  if (cartIcon) {
    const countBadge = cartIcon.parentElement.querySelector('.cart-count') || document.createElement('span');
    countBadge.className = 'cart-count';
    countBadge.textContent = count;
    countBadge.style.cssText = `
      position: absolute;
      top: -8px;
      right: -8px;
      background-color: var(--nav-active-bg);
      color: var(--text-color);
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    `;
    
    if (!cartIcon.parentElement.querySelector('.cart-count')) {
      cartIcon.parentElement.style.position = 'relative';
      cartIcon.parentElement.appendChild(countBadge);
    }
    
    if (count === 0) {
      countBadge.style.display = 'none';
    } else {
      countBadge.style.display = 'flex';
    }
  }
}

// Show toast notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast') || createToastElement();
  toast.textContent = message;
  toast.style.background = type === 'success' ? 'var(--nav-active-bg)' : 'var(--text-main-bg)';
  toast.style.display = 'block';
  
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

// Create toast element if it doesn't exist
function createToastElement() {
  const cartLink = document.querySelector('a[href="cart.html"]');
  const toast = document.createElement('div');
  toast.id = 'toast';

  if (cartLink) {
    const rect = cartLink.getBoundingClientRect();
    toast.style.position = "fixed";
    toast.style.left = `${rect.right + 10}px`;
    toast.style.top = `${rect.top + 5}px`;
    toast.style.color = "white";
    toast.style.padding = "10px";
    toast.style.borderRadius = "10px";
    toast.style.zIndex = "1000";
    toast.style.display = 'none';
    toast.style.fontFamily = 'sans-serif';
  } else {
    // Fallback styling if cart icon not found
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #333;
      color: #fff;
      padding: 12px 20px;
      border-radius: 6px;
      display: none;
      font-family: sans-serif;
      z-index: 999;
      box-shadow: 0 0 10px rgba(0,0,0,0.2);
    `;
  }
  document.body.appendChild(toast);
  return toast;
}

// Filter products
function filterProducts() {
  const category = document.getElementById('category').value;
  const sort = document.getElementById('sort').value;
  
  let filtered = products;
  
  // Filter by category
  if (category !== 'all') {
    filtered = products.filter(p => p.category === category);
  }
  
  // Sort products
  filtered.sort((a, b) => {
    if (sort === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sort === 'price') {
      return a.price - b.price;
    }
  });
  
  displayProducts(filtered);
}

// Initialize filters
document.getElementById('category')?.addEventListener('change', filterProducts);
document.getElementById('sort')?.addEventListener('change', filterProducts);

document.addEventListener('DOMContentLoaded', () => {
  fetchProducts();
  updateCartCount();
  updateAuthUI();
});

