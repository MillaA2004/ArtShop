// Примерни статични продукти
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

// DOM елементи
const categoryFilter = document.getElementById("category");
const sortSelect = document.getElementById("sort");
const productList = document.getElementById("product-list");

// Слушатели
categoryFilter.addEventListener("change", updateProductList);
sortSelect.addEventListener("change", updateProductList);

// Рендиране
function updateProductList() {
    const category = categoryFilter.value;
    const sortBy = sortSelect.value;

    let filtered = [...products];

    // Филтриране
    if (category !== "all") {
        filtered = filtered.filter(p => p.category === category);
    }

    // Сортиране
    if (sortBy === "name") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "price") {
        filtered.sort((a, b) => a.price - b.price);
    }

    // Изчистване на текущия списък
    productList.innerHTML = "";

    // Принтиране
    filtered.forEach(p => {
    const div = document.createElement("div");
    div.classList.add("product");
    div.innerHTML = `
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>Price: $${p.price}</p>
        <button class="add-to-cart-btn">Add to Cart</button>
    `;
    const btn = div.querySelector(".add-to-cart-btn");
    btn.addEventListener("click", () => addToCart(p));
    productList.appendChild(div);
});
    // Ако няма продукти, показваме съобщение
    if (filtered.length === 0) {
        productList.innerHTML = "<p>No products found.</p>";
    }
}

// Първоначално зареждане
updateProductList();

function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));

    const message = document.createElement("div");
    message.textContent = `${product.name} was added to your cart!`;
    // Find the <a href="cart.html"> element
    const cartLink = document.querySelector('a[href="cart.html"]');
    if (cartLink) {
        // Position the message next to the cart link
        const rect = cartLink.getBoundingClientRect();
        message.style.position = "fixed";
        message.style.left = `${rect.right + 10}px`;
        message.style.top = `${rect.top+5}px`;
        message.style.background = "rgba(120, 200, 230, 0.7)";
        message.style.color = "white";
        message.style.padding = "10px";
        message.style.borderRadius = "10px";
        message.style.zIndex = "1000";
    } else {
        // Fallback to center if cart link not found
        message.style = "position:fixed;top: 50%;left:50%;background:rgba(120, 200, 230, 0.7);color:white;padding:10px;border-radius:6px;z-index:1000;";
    }
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 3000);
}

