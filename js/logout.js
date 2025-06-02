function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Check if user is authenticated
function isAuthenticated() {
  return !!getAuthToken();
}


// Logout function
function logout() {
  // Clear authentication data
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('isAdmin');

  window.location.href = 'index.html';
}

// Update UI based on auth status
function updateAuthUI() {
  const accountLink = document.querySelector('a[href="signup.html"]');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  if (accountLink && isAuthenticated()) {
    accountLink.innerHTML = `<i class="fa fa-user"></i> ${isAdmin ? 'Admin' : (user.fullName || 'Account')}`;
    accountLink.href = '#';
    
    accountLink.title = 'Logout';
     accountLink.onclick = function(event) {
      event.preventDefault(); 
      logout();
    };
  }
}

document.addEventListener("DOMContentLoaded", updateAuthUI);

function performAdminLogout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('isAdmin');
  window.location.href = 'index.html';
}