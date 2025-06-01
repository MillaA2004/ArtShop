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

    if (category !== "all") {
        filtered = filtered.filter(p => p.category === category);
    }

    if (sortBy === "name") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "price") {
        filtered.sort((a, b) => a.price - b.price);
    }

    productList.innerHTML = "";

    
filtered.forEach(p => {
    const div = document.createElement("div");
    div.classList.add("product");
    div.innerHTML = `
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>Price: $${p.price}</p>
        <button class="delete-btn" data-id="${p._id}">Delete</button>
    `;

    div.querySelector(".delete-btn").addEventListener("click", () => {
        fetch(`/api/products/${p._id}`, { method: "DELETE" })
            .then(res => {
                if (res.ok) div.remove();
                else alert("Delete failed.");
            });
    });

    productList.appendChild(div);
});

if (filtered.length === 0) {
    productList.innerHTML = "<p>No products found.</p>";
}
}

updateProductList();


