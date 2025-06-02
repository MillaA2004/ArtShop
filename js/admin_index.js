/*
const products = [
    { name: "Pose", price: 30, category: "digital art", image: "img/shadows.jpg" },
    { name: "MediBang Pro", price: 20, category: "software", image: "img/medibang.png" },
    { name: "Pro Create", price: 20, category: "software", image: "img/procreate.png" },
    { name: "Portrait", price: 35, category: "digital art", image: "img/purple-portrait.jpg" },
    { name: "Flower", price: 30, category: "traditional art", image: "img/flower.jpg" },
    { name: "MediBang Pro", price: 20, category: "software", image: "img/medibang.png" },
    { name: "Pro Create", price: 20, category: "software", image: "img/procreate.png" },
    { name: "Dragon", price: 15, category: "traditional art", image: "img/dragon.jpg" }
];
*/
const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    initializePopup();
    fetchProducts(); 
});
 
function initializePopup() {
    const popupOverlay = document.getElementById('popup-overlay');
    const productForm = document.getElementById('productForm');
    const popupTitle = popupOverlay ? popupOverlay.querySelector('h3') : null;
    const submitButton = productForm ? productForm.querySelector('button[type="submit"]') : null;
    const darkModeToggle = document.getElementById('darkModeToggle');
    const sidenavPlusButton = document.querySelector('.sidenav #a3'); // Button +
    const closePopupButton = document.getElementById('close-popup');

    if (sidenavPlusButton) {
        sidenavPlusButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (!popupOverlay || !productForm || !popupTitle || !submitButton) return;

            productForm.reset();
            productForm.removeAttribute('data-editing-product-id');
            if (popupTitle) popupTitle.textContent = 'Add New Product';
            if (submitButton) submitButton.textContent = 'Add Product';
            
            popupOverlay.style.display = 'flex';
            const isDark = document.body.classList.contains('dark-mode');
            document.querySelector('.popup-form').classList.toggle('dark-mode', isDark);
        });
    }

    if (closePopupButton) {
        closePopupButton.addEventListener('click', () => {
            if (popupOverlay) {
                popupOverlay.style.display = 'none';
                if (productForm) productForm.reset();
                if (productForm) productForm.removeAttribute('data-editing-product-id');
                if (popupTitle) popupTitle.textContent = 'Add New Product';
                if (submitButton) submitButton.textContent = 'Add Product';
            }
        });
    }

    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark-mode');
            const popupFormElement = document.querySelector('.popup-form');
            if (popupFormElement) popupFormElement.classList.toggle('dark-mode', isDark);
        });
    }
}

async function handleProductSubmit(event) {
    event.preventDefault(); 

    const productForm = event.target; // submitted form
    const editingProductId = productForm.dataset.editingProductId;

    const nameInput = document.getElementById('name');
    const priceInput = document.getElementById('price');
    const categoryInput = document.getElementById('productCategory');
    const descriptionInput = document.getElementById('description');
    const imageInput = document.getElementById('image');
    const stockInput = document.getElementById('stock'); 

    if (!nameInput || !priceInput || !categoryInput || !descriptionInput || !imageInput || !stockInput) {
        showToast('Form elements not found. Please check HTML.', 'error');
        return;
    }

    const productData = {
        name: nameInput.value,
        price: parseFloat(priceInput.value),
        category: categoryInput.value,
        description: descriptionInput.value,
        image: imageInput.value,
        stock: stockInput ? parseInt(stockInput.value) : 0 
    };

    if (!productData.name || isNaN(productData.price) || !productData.category || !productData.description || !productData.image) {
        showToast('Please fill in all required fields correctly.', 'error');
        return;
    }

    let url = `${API_URL}/products`;
    let method = 'POST';

    if (editingProductId) {
        url = `${API_URL}/products/${editingProductId}`;
        method = 'PUT';
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(productData)
        });

        const data = await response.json();
        const popupOverlay = document.getElementById('popup-overlay');
        const popupForm = document.getElementById('productForm'); // Renamed for clarity
        const popupTitle = popupOverlay ? popupOverlay.querySelector('h3') : null;
        const submitButton = popupForm ? popupForm.querySelector('button[type="submit"]') : null;

        if (data.success) {
            showToast(editingProductId ? 'Product updated successfully!' : 'Product added successfully!');
            
            if (popupOverlay) popupOverlay.style.display = 'none';
            if (popupForm) {
                popupForm.reset();
                popupForm.removeAttribute('data-editing-product-id');
            }
            if (popupTitle) popupTitle.textContent = 'Add New Product';
            if (submitButton) submitButton.textContent = 'Add Product';

            fetchProducts(); 
        } else {
            showToast(data.message || (editingProductId ? 'Failed to update product' : 'Failed to add product'), 'error');
        }
    } catch (error) {
        console.error(editingProductId ? 'Error updating product:' : 'Error adding product:', error);
        showToast('Network error. Please try again.', 'error');
    }
}

async function fetchProducts() {
    const categoryFilterElement = document.getElementById('category');
    const sortSelectElement = document.getElementById('sort');

    try {
        const category = categoryFilterElement ? categoryFilterElement.value : 'all';
        const sortBy = sortSelectElement ? sortSelectElement.value : 'name';
        
        const queryParams = new URLSearchParams({
            category: category !== 'all' ? category : '',
            sort: sortBy,
            order: 'asc'
        });
        
        const response = await fetch(`${API_URL}/products?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayProducts(data.products);
        } else {
            showToast(data.message || 'Failed to fetch products', 'error');
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        showToast('Network error. Please try again.', 'error');
    }
}

function displayProducts(products) {
    const productList = document.getElementById('product-list');
    if (!productList) return;
    productList.innerHTML = '';
    
    if (!products || products.length === 0) {
        productList.innerHTML = '<p class="no-products">No products found.</p>';
        return;
    }
    
    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product';
        
        const priceDisplay = product.price === 0 ? 'Free' : `$${product.price.toFixed(2)}`;
        
        productElement.innerHTML = `
            <img src="${product.image || '/img/placeholder.jpg'}" alt="${product.name || 'Product Image'}" onerror="this.onerror=null; this.src='/img/placeholder.jpg'">
            <h3>${product.name || 'Unnamed Product'}</h3>
            <p class="description">${product.description || 'No description available.'}</p>
            <p class="price">${priceDisplay}</p>
            <div class="admin-controls">
                <button onclick="editProduct('${product._id}')" class="edit-btn">
                    <i class="fa fa-edit"></i> Edit
                </button>
                <button onclick="deleteProduct('${product._id}')" class="delete-btn">
                    <i class="fa fa-trash"></i>
                </button>
            </div>
        `;
        productList.appendChild(productElement);
    });
}

// Delete product
async function deleteProduct(productId) {
    if (!productId) return;
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        const data = await response.json();

        if (data.success) {
            showToast('Product deleted successfully!');
            fetchProducts(); // Refresh list
        } else {
            showToast(data.message || 'Failed to delete product', 'error');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Network error. Please try again.', 'error');
    }
}

async function editProduct(productId) {
    if (!productId) return;

    const popupOverlay = document.getElementById('popup-overlay');
    const productForm = document.getElementById('productForm');
    const popupTitle = popupOverlay ? popupOverlay.querySelector('h3') : null;
    const submitButton = productForm ? productForm.querySelector('button[type="submit"]') : null;

    if (!popupOverlay || !productForm || !popupTitle || !submitButton) {
        showToast('Popup form elements not found.', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        const data = await response.json();

        if (data.success && data.product) {
            const product = data.product;
            // Place the info
            document.getElementById('name').value = product.name || '';
            document.getElementById('price').value = product.price || 0;
            document.getElementById('productCategory').value = product.category || '';
            document.getElementById('description').value = product.description || '';
            document.getElementById('image').value = product.image || '';
            document.getElementById('stock').value = product.stock || 0;

            // EDIT mode
            productForm.dataset.editingProductId = productId; 
            popupTitle.textContent = `Edit Product: ${product.name}`;
            submitButton.textContent = 'Update Product';

            popupOverlay.style.display = 'flex';
            const isDark = document.body.classList.contains('dark-mode');
            document.querySelector('.popup-form').classList.toggle('dark-mode', isDark);
        } else {
            showToast(data.message || 'Failed to fetch product details.', 'error');
        }
    } catch (error) {
        console.error('Error fetching product for edit:', error);
        showToast('Network error fetching product details.', 'error');
    }
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

// Filters
const categoryFilterElement = document.getElementById("category");
const sortSelectElement = document.getElementById("sort");

if (categoryFilterElement) {
    categoryFilterElement.addEventListener("change", fetchProducts);
}
if (sortSelectElement) {
    sortSelectElement.addEventListener("change", fetchProducts);
}

