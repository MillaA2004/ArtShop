// API Base URL
const API_URL = 'http://localhost:5000/api';

function getAuthToken() {
  return localStorage.getItem('authToken');
}

function isAuthenticated() {
  return !!getAuthToken();
    }

async function loadCart() {
  try {
    let cartItems = [];
    let subtotal = 0;
    
    if (isAuthenticated()) {
      const response = await fetch(`${API_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        cartItems = data.cart;
        subtotal = data.subtotal;
      }
    } else {
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      cartItems = localCart.map(item => ({
        product: {
          _id: item.id,
          name: item.name,
          price: item.price,
          image: item.image
        },
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      }));
      subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    }
    
    displayCart(cartItems, subtotal);
  } catch (error) {
    console.error('Error loading cart:', error);
    showToast('Error loading cart', 'error');
  }
    }

function displayCart(cartItems, subtotal) {
  const cartPreview = document.getElementById('cart-preview');
  const cartCount = document.getElementById('cart-count');
  const totalPrice = document.getElementById('total-price');
  
  cartCount.textContent = cartItems.length;
  
  if (cartItems.length === 0) {
    cartPreview.innerHTML = '<p>Your cart is empty</p>';
    totalPrice.textContent = '$0.00';
            return;
        }

  cartPreview.innerHTML = cartItems.map(item => `
    <div class="cart-item" style="display: flex; align-items: center; margin-bottom: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
      <img src="${item.product.image}" alt="${item.product.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;" onerror="this.src='img/placeholder.jpg'">
      <div style="flex: 1;">
        <h4 style="margin: 0; font-size: 14px;">${item.product.name}</h4>
        <p style="margin: 0; font-size: 12px; color: #666;">$${item.product.price.toFixed(2)} x ${item.quantity}</p>
      </div>
      <div style="display: flex; align-items: center; gap: 5px;">
        <button onclick="updateQuantity('${item.product._id}', ${item.quantity - 1})" style="padding: 2px 6px; cursor: pointer;">-</button>
        <span>${item.quantity}</span>
        <button onclick="updateQuantity('${item.product._id}', ${item.quantity + 1})" style="padding: 2px 6px; cursor: pointer;">+</button>
        <button onclick="removeFromCart('${item.product._id}')" style="margin-left: 10px; color: red; cursor: pointer; border: none; background: none;">×</button>
      </div>
    </div>
  `).join('');
  
  // Calculate totals (including tax and shipping)
  const tax = subtotal * 0.1; // 10% tax
  const shipping = subtotal > 50 ? 0 : 5; // Free shipping >$50
  const total = subtotal + tax + shipping;

  totalPrice.textContent = `$${total.toFixed(2)}`;
  
  window.cartTotals = {
    subtotal,
    tax,
    shipping,
    total
  };
}

async function updateQuantity(productId, newQuantity) {
  if (newQuantity < 0) return;
  
  try {
    if (isAuthenticated()) {
      const response = await fetch(`${API_URL}/cart/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          productId,
          quantity: newQuantity
        })
      });
      
      const data = await response.json();
      if (data.success) {
        loadCart();
        showToast(data.message);
      } else {
        showToast(data.message || 'Failed to update cart', 'error');
      }
    } else {
      let cart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (newQuantity === 0) {
        cart = cart.filter(item => item.id !== productId);
      } else {
        const item = cart.find(item => item.id === productId);
        if (item) {
          item.quantity = newQuantity;
        }
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      loadCart();
    }
            } catch (error) {
    console.error('Error updating quantity:', error);
    showToast('Error updating cart', 'error');
            }
        }

async function removeFromCart(productId) {
  await updateQuantity(productId, 0);
}

async function clearCart() {
  if (!confirm('Are you sure you want to clear your cart?')) return;
  
  try {
    if (isAuthenticated()) {
      const response = await fetch(`${API_URL}/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        loadCart();
        showToast('Cart cleared');
      }
    } else {
      localStorage.removeItem('cart');
      loadCart();
      showToast('Cart cleared');
    }
  } catch (error) {
    console.error('Error clearing cart:', error);
    showToast('Error clearing cart', 'error');
  }
    }

async function processCheckout(e) {
        e.preventDefault();
  
  if (!isAuthenticated()) {
    showToast('Please login to complete your purchase', 'error');
    setTimeout(() => {
      window.location.href = 'signup.html';
    }, 2000);
            return;
        }

  const formElement = e.target.closest('form'); // Get the form element
  if (!formElement) {
    console.error('Checkout form not found');
    showToast('An error occurred, checkout form not found.', 'error');
            return;
        }
  const formData = new FormData(formElement);
  const sameAddress = document.getElementById('same-address').checked;
  
  const rawCardNumber = formData.get('cardnumber') || '';
  const numericCardNumber = rawCardNumber.replace(/\D/g, '');
  const cardLast4 = numericCardNumber.slice(-4);

  console.log('Raw Card Number:', rawCardNumber);
  console.log('Numeric Card Number:', numericCardNumber);
  console.log('CardLast4 for API:', cardLast4);

  const checkoutData = {
    billingAddress: {
      fullName: formData.get('firstname'),
      email: formData.get('email'),
      street: formData.get('address'),
      city: formData.get('city'),
      state: formData.get('state'),
      zip: formData.get('zip')
    },
    sameAsShipping: sameAddress,
    payment: {
      method: 'credit_card',
      cardLast4: cardLast4 
    }
  };
  
  if (!sameAddress) {
    checkoutData.shippingAddress = {
      fullName: formData.get('shippingname'),
      email: formData.get('shippingemail'),
      street: formData.get('shippingaddress'),
      city: formData.get('shippingcity'),
      state: formData.get('shippingstate'),
      zip: formData.get('shippingzip')
    };
        }

  try {
    const submitBtn = document.getElementById('checkout-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    const response = await fetch(`${API_URL}/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(checkoutData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast('Order placed successfully!');
      setTimeout(() => {
        window.location.href = `order-confirmation.html?orderId=${data.order._id}`;
      }, 1500);
    } else {
      showToast(data.message || 'Failed to process order', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Continue to checkout';
            }
        } catch (error) {
    console.error('Checkout error:', error);
    showToast('Network error. Please try again.', 'error');
    document.getElementById('checkout-btn').disabled = false;
    document.getElementById('checkout-btn').textContent = 'Continue to checkout';
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.style.background = type === 'success' ? 'var(--nav-active-bg)' : 'var(--header-bg)';
    toast.style.display = 'block';

    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }
}

// Initialize cart page
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  
  document.getElementById('clear-cart')?.addEventListener('click', clearCart);
  
  const checkoutForm = document.getElementById('checkoutForm'); // Use the new ID
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', processCheckout);
  }
  
  const ccInput = document.getElementById('ccnum');
  if (ccInput) {
    ccInput.addEventListener('input', (e) => {
      let value = e.target.value;
      let numericValue = value.replace(/\D/g, '');
      
      // <16 digits
      if (numericValue.length > 16) {
        numericValue = numericValue.substring(0, 16);
      }
      
      let formattedValue = '';
      for (let i = 0; i < numericValue.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formattedValue += ' ';
        }
        formattedValue += numericValue[i];
      }
      e.target.value = formattedValue;
    });
  }
  
  if (isAuthenticated()) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.email) {
      document.getElementById('email').value = user.email;
    }
    if (user.fullName) {
      document.getElementById('fname').value = user.fullName;
}
  }
});

