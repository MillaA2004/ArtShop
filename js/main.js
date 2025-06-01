document.addEventListener("DOMContentLoaded", () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const preview = document.getElementById("cart-preview");
  const totalPriceDisplay = document.getElementById("total-price");
  const cartCount = document.getElementById("cart-count");
  const clearBtn = document.getElementById("clear-cart");

  // Защитна проверка
  if (!preview || !totalPriceDisplay || !clearBtn) {
    console.warn("Required elements not found");
    return;
  }

  // Изчистваме стара визуализация (ако някой код е го изпълнил повторно)
  preview.innerHTML = "";

  let total = 0;
  cart.forEach(item => {
    const itemDiv = document.createElement("div");
    itemDiv.style.display = "flex";
    itemDiv.style.alignItems = "center";
    itemDiv.style.marginBottom = "10px";

    const img = document.createElement("img");
    img.src = item.image || "icons/default-image.png";
    img.alt = item.name || "Item";
    img.style.width = "40px";
    img.style.height = "40px";
    img.style.marginRight = "10px";
    img.style.objectFit = "cover";

    const name = document.createElement("span");
    name.textContent = item.name || "Unnamed";

    itemDiv.appendChild(img);
    itemDiv.appendChild(name);
    preview.appendChild(itemDiv);

    total += item.price || 0;
  });

  totalPriceDisplay.textContent = `$${total.toFixed(2)}`;
  if (cartCount) cartCount.textContent = cart.length;

  // Clear cart functionality
  clearBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear the cart?")) {
      localStorage.removeItem("cart");
      window.location.reload(); // Това е еднократно
    }
  });

  // Inputmask
  if (window.Inputmask) {
    Inputmask("9999 9999 9999 9999").mask(document.getElementById("ccnum"));
  }
});
