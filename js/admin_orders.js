const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    fetchOrders();
});

async function fetchOrders() {
    try {
        const response = await fetch(`${API_URL}/admin/orders`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayOrders(data.orders);
        } else {
            showToast(data.message || 'Failed to fetch orders', 'error');
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
        showToast('Network error. Please try again.', 'error');
    }
}

function displayOrders(orders) {
    const orderList = document.getElementById('order-list');
    if (!orderList) return;
    
    orderList.innerHTML = '';
    
    if (!orders || orders.length === 0) {
        orderList.innerHTML = '<p class="no-orders">No orders found.</p>';
        return;
    }
    
    orders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = 'order-item';
        
        const totalAmount = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        orderElement.innerHTML = `
            <div class="order-details">
                <h3>Order #${order._id}</h3>
                <p>Customer: ${order.user.email}</p>
                <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p>Total: $${totalAmount.toFixed(2)}</p>
                <p>Status: ${order.status}</p>
            </div>
            <div class="order-items">
                <h4>Items:</h4>
                ${order.items.map(item => `
                    <div class="order-item-detail">
                        <p>${item.name} x ${item.quantity}</p>
                        <p>$${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                `).join('')}
            </div>
        `;
        orderList.appendChild(orderElement);
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