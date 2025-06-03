const API_URL = 'http://localhost:5000/api';
        
        // Get order ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('orderId');
        
        //order details
        async function loadOrderDetails() {
            if (!orderId) {
                document.getElementById('order-details').innerHTML = '<p>No order ID provided.</p>';
                return;
            }
            
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch(`${API_URL}/orders/${orderId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    displayOrderDetails(data.order);
                } else {
                    document.getElementById('order-details').innerHTML = '<p>Error loading order details.</p>';
                }
            } catch (error) {
                console.error('Error fetching order:', error);
                document.getElementById('order-details').innerHTML = '<p>Error loading order details.</p>';
            }
        }
        
        function displayOrderDetails(order) {
            document.getElementById('order-number').textContent = order._id;
            document.getElementById('order-date').textContent = new Date(order.createdAt).toLocaleDateString();
            document.getElementById('order-status').textContent = order.status.charAt(0).toUpperCase() + order.status.slice(1);
            
            const itemsHtml = order.items.map(item => `
                <div class="order-item">
                    <span>${item.name} x ${item.quantity}</span>
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `).join('');
            
            document.getElementById('order-items').innerHTML = itemsHtml;
            
            document.getElementById('subtotal').textContent = `$${order.subtotal.toFixed(2)}`;
            document.getElementById('tax').textContent = `$${order.tax.toFixed(2)}`;
            document.getElementById('shipping').textContent = `$${order.shipping.toFixed(2)}`;
            document.getElementById('total').textContent = `$${order.total.toFixed(2)}`;
        }
                
        loadOrderDetails();