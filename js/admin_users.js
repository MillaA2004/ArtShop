const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
});

async function fetchUsers() {
    try {
        const response = await fetch(`${API_URL}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayUsers(data.users);
        } else {
            showToast(data.message || 'Failed to fetch users', 'error');
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        showToast('Network error. Please try again.', 'error');
    }
}

function displayUsers(users) {
    const userList = document.getElementById('order-list');
    if (!userList) return;
    
    userList.innerHTML = '';
    
    if (!users || users.length === 0) {
        userList.innerHTML = '<p class="no-users">No users found.</p>';
        return;
    }
    
    users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.className = 'user-item';
        
        userElement.innerHTML = `
            <div class="user-details">
                <h3>${user.email}</h3>
                <p>Role: ${user.role}</p>
                <p>Created: ${new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
        `;
        userList.appendChild(userElement);
    });
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast') || createToastElement();
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function createToastElement() {
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
    return toast;
} 