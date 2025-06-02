const API_URL = 'http://localhost:5000/api';

let isLoginForm = true;

function toggleForm() {
  isLoginForm = !isLoginForm;
  
  const formTitle = document.getElementById('form-title');
  const formSubtext = document.getElementById('form-subtext');
  const confirmPasswordContainer = document.getElementById('confirm-password-container');
  const submitButton = document.getElementById('submit-button');
  const toggleMessage = document.getElementById('toggle-message');
  
  if (isLoginForm) {
    formTitle.textContent = 'Sign In';
    formSubtext.textContent = 'Please enter your credentials to sign in.';
    confirmPasswordContainer.style.display = 'none';
    submitButton.textContent = 'Sign In';
    toggleMessage.innerHTML = "Don't have an account? <a onclick='toggleForm()' class='form-toggle'>Sign Up</a>";
  } else {
    formTitle.textContent = 'Sign Up';
    formSubtext.textContent = 'Please fill in this form to create an account.';
    confirmPasswordContainer.style.display = 'block';
    submitButton.textContent = 'Sign Up';
    toggleMessage.innerHTML = "Already have an account? <a onclick='toggleForm()' class='form-toggle'>Sign In</a>";
  }
}

// Handle form submission
document.getElementById('auth-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('psw').value;
  
  if (!isLoginForm) {
    const repeatPassword = document.getElementById('psw-repeat').value;
    if (password !== repeatPassword) {
      showMessage('Passwords do not match', 'error');
      return;
    }
  }
  
  try {
    const endpoint = isLoginForm ? '/auth/login' : '/auth/register';
    const body = isLoginForm 
      ? { email, password }
      : { 
          email, 
          password, 
          fullName: email.split('@')[0] // Use email prefix as default name
        };
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    console.log('Login API Response:', data);

    if (data.success) {
      // Store token and user data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      console.log('User data from response:', data.user);
      console.log('User role from response:', data.user ? data.user.role : 'N/A');

      // Check user role and set isAdmin flag
      if (data.user && data.user.role === 'admin') {
        localStorage.setItem('isAdmin', 'true');
        console.log('isAdmin flag SET to true');
      } else {
        localStorage.removeItem('isAdmin'); // Ensure it's cleared for non-admins
        console.log('isAdmin flag REMOVED or not set');
      }
      
      showMessage(data.message, 'success');
      
      // Sync cart if user has items in local storage
      await syncCart();
      
      // Redirect based on role
      setTimeout(() => {
        if (data.user && data.user.role === 'admin') {
          window.location.href = 'admin_index.html';
        } else {
          window.location.href = 'index.html';
        }
      }, 1000);
    } else {
      showMessage(data.message || 'Authentication failed', 'error');
    }
  } catch (error) {
    console.error('Auth error:', error);
    showMessage('Network error. Please try again.', 'error');
  }
});

// Sync local cart with server
async function syncCart() {
  const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  if (localCart.length > 0) {
    try {
      const token = localStorage.getItem('authToken');
      const cartItems = localCart.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));
      
      await fetch(`${API_URL}/cart/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cart: cartItems })
      });
      
      // Clear local cart after sync
      localStorage.removeItem('cart');
    } catch (error) {
      console.error('Cart sync error:', error);
    }
  }
}

// Show messages
function showMessage(message, type) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;
  
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
    background-color: ${type === 'success' ? '#4CAF50' : '#f44336'};
  `;
  
  document.body.appendChild(messageDiv);
  
  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
}

// Check if user is already logged in
function checkAuth() {
  const token = localStorage.getItem('authToken');
  if (token) {
    // Optionally verify token with server
    window.location.href = 'index.html';
  }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
  
  .form-toggle {
    color: #007bff;
    cursor: pointer;
    text-decoration: underline;
  }
  
  .form-toggle:hover {
    color: #0056b3;
  }
`;
document.head.appendChild(style);

// Initialize
checkAuth();
