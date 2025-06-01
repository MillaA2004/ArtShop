function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    document.getElementById("cart-count").textContent = cart.length;
}

updateCartCount();


document.addEventListener("DOMContentLoaded", () => {
    // More robust selector for cart container
    const cartContainer = document.querySelector(".container .col-25 .container") || 
                         document.querySelector(".col-25 .container") ||
                         document.querySelector(".container");
    
    if (!cartContainer) {
        console.error("Cart container not found");
        return;
    }

    // More flexible checkout button selector
    const checkoutBtn = cartContainer.querySelector("input[type='submit']") || 
                       cartContainer.querySelector("button[type='submit']") ||
                       document.querySelector("input[type='submit']");

    if (!checkoutBtn) {
        console.error("Checkout button not found");
        return;
    }

    // Create preview elements
    let preview = document.getElementById("cart-preview");
    if (!preview) {
        preview = document.createElement("div");
        preview.id = "cart-preview";
        preview.style.marginBottom = "15px";
        cartContainer.insertBefore(preview, checkoutBtn);
    }

    let totalPriceEl = document.getElementById("total-price");
    if (!totalPriceEl) {
        totalPriceEl = document.createElement("span");
        totalPriceEl.id = "total-price";
        totalPriceEl.style.fontWeight = "bold";
        totalPriceEl.style.fontSize = "18px";
        
        const totalContainer = document.createElement("div");
        totalContainer.style.marginBottom = "15px";
        totalContainer.innerHTML = `Total: `;
        totalContainer.appendChild(totalPriceEl);
        cartContainer.insertBefore(totalContainer, checkoutBtn);
    }

    let clearBtn = document.getElementById("clear-cart");
    if (!clearBtn) {
        clearBtn = document.createElement("button");
        clearBtn.id = "clear-cart";
        clearBtn.textContent = "Clear Cart";
        clearBtn.type = "button"; // Explicitly set type to prevent form submission
        clearBtn.style.marginTop = "10px";
        clearBtn.style.marginLeft = "10px";
        clearBtn.style.padding = "8px 16px";
        clearBtn.style.backgroundColor = "#dc3545";
        clearBtn.style.color = "white";
        clearBtn.style.border = "none";
        clearBtn.style.borderRadius = "4px";
        clearBtn.style.cursor = "pointer";
        cartContainer.appendChild(clearBtn);
    }

    // Load and display cart
    function loadCart() {
        let cart = [];
        try {
            cart = JSON.parse(localStorage.getItem("cart")) || [];
        } catch (error) {
            console.error("Error parsing cart data:", error);
            localStorage.removeItem("cart"); // Clear corrupted data
            cart = [];
        }

        if (cart.length === 0) {
            preview.innerHTML = "<p style='color: var(--text-main); font-style: italic;'>Your cart is empty.</p>";
            totalPriceEl.textContent = "$0.00";
            checkoutBtn.disabled = true;
            checkoutBtn.style.opacity = "0.5";
            return;
        }

        // Enable checkout button
        checkoutBtn.disabled = false;
        checkoutBtn.style.opacity = "1";

        // Display cart items
        let total = 0;
preview.innerHTML = "";

cart.forEach((item, index) => {
    const itemDiv = document.createElement("div");
    itemDiv.style.display = "flex";
    itemDiv.style.alignItems = "center";
    itemDiv.style.marginBottom = "10px";
    itemDiv.style.padding = "8px";
    itemDiv.style.border = "1px solid #ddd";
    itemDiv.style.borderRadius = "4px";

    const img = document.createElement("img");
    img.src = item.image || "icons/default-image.png";
    img.alt = item.name || "Unnamed Product";
    img.style.width = "40px";
    img.style.height = "40px";
    img.style.objectFit = "cover";
    img.style.marginRight = "10px";
    img.style.borderRadius = "4px";

    const details = document.createElement("div");
    details.style.flex = "1";

    const name = document.createElement("div");
    name.textContent = item.name || "Unnamed Product";
    name.style.fontWeight = "bold";
    name.style.marginBottom = "4px";

    const price = document.createElement("div");
    const itemPrice = parseFloat(item.price) || 0;
    price.textContent = `$${itemPrice.toFixed(2)}`;
    price.style.color = "var(--text-color, --button-color)";

    details.appendChild(name);
    details.appendChild(price);

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "X";
    removeBtn.style.backgroundColor = "var(--button-color, --text-color)";
    removeBtn.style.color = "var(--text-color, --button-color)";
    removeBtn.style.border = "none";
    removeBtn.style.padding = "4px 8px";
    removeBtn.style.marginLeft = "10px";
    removeBtn.style.borderRadius = "4px";
    removeBtn.style.cursor = "pointer";

    // Remove item on click
    removeBtn.addEventListener("click", () => {
        cart.splice(index, 1);                        
        localStorage.setItem("cart", JSON.stringify(cart));  
        location.reload();                            
    });

    itemDiv.appendChild(img);
    itemDiv.appendChild(details);
    itemDiv.appendChild(removeBtn); 

    preview.appendChild(itemDiv);

    total += itemPrice;
    });

    totalPriceEl.textContent = `$${total.toFixed(2)}`;
    }

    // Initialize cart display
    loadCart();

    // Apply input mask for credit card if Inputmask is available
    if (typeof Inputmask !== "undefined") {
        const ccInput = document.getElementById("ccnum");
        if (ccInput) {
            Inputmask("xxxx xxxx xxxx xxxx").mask(ccInput);
        }
    }

    // Clear cart functionality
    clearBtn.addEventListener("click", (e) => {
        e.preventDefault(); // Prevent any form submission
        e.stopPropagation();
        
        if (confirm("Are you sure you want to clear the cart?")) {
            try {
                localStorage.removeItem("cart");
                loadCart(); // Refresh display instead of full page reload
                alert("Cart cleared successfully!");
                showToast(`${item.name} removed from cart`);
            } catch (error) {
                console.error("Error clearing cart:", error);
                alert("Error clearing cart. Please try again.");
            }
        }
    });

    // Validation functions
    function validateCardNumber(number) {
        // Remove spaces and check if it's 16 digits
        const cleaned = number.replace(/\s+/g, "");
        return /^\d{16}$/.test(cleaned);
    }

    function validateExpiryMonth(month) {
        const monthNum = parseInt(month);
        return monthNum >= 1 && monthNum <= 12;
    }

    function validateExpiryYear(year) {
        const currentYear = new Date().getFullYear();
        const yearNum = parseInt(year);
        
        // Handle both 2-digit and 4-digit years
        const fullYear = yearNum < 100 ? 2000 + yearNum : yearNum;
        return fullYear >= currentYear && fullYear <= currentYear + 20;
    }

    function validateCVV(cvv) {
        return /^\d{3,4}$/.test(cvv);
    }

    // Checkout form submission
    checkoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Get form values with null checks
        const nameField = document.getElementById("cname");
        const numberField = document.getElementById("ccnum");
        const monthField = document.getElementById("expmonth");
        const yearField = document.getElementById("expyear");
        const cvvField = document.getElementById("cvv");

        // Check if all required fields exist
        if (!nameField || !numberField || !monthField || !yearField || !cvvField) {
            alert("Payment form fields are missing. Please check the HTML structure.");
            return;
        }

        // Get and trim values
        const name = nameField.value.trim();
        const number = numberField.value.replace(/\s+/g, "");
        const month = monthField.value.trim();
        const year = yearField.value.trim();
        const cvv = cvvField.value.trim();

        // Validate required fields
        if (!name || !number || !month || !year || !cvv) {
            alert("Please fill in all payment fields.");
            return;
        }

        // Validate individual fields
        if (!validateCardNumber(number)) {
            alert("Card number must be exactly 16 digits.");
            numberField.focus();
            return;
        }

        if (!validateExpiryMonth(month)) {
            alert("Please enter a valid month (1-12).");
            monthField.focus();
            return;
        }

        if (!validateExpiryYear(year)) {
            alert("Please enter a valid expiry year.");
            yearField.focus();
            return;
        }

        if (!validateCVV(cvv)) {
            alert("CVV must be 3 or 4 digits.");
            cvvField.focus();
            return;
        }

        // Check if cart is not empty
        let cart = [];
        try {
            cart = JSON.parse(localStorage.getItem("cart")) || [];
        } catch (error) {
            console.error("Error reading cart:", error);
        }

        if (cart.length === 0) {
            alert("Your cart is empty. Please add items before checkout.");
            return;
        }

        // Process successful payment
        try {
            localStorage.removeItem("cart");
            alert("Thank you for your purchase! Your order has been processed successfully.");
            
            // Redirect to homepage
            if (typeof window !== "undefined") {
                window.location.href = "index.html";
            }
        } catch (error) {
            console.error("Error processing payment:", error);
            alert("There was an error processing your payment. Please try again.");
        }
    });

    // Prevent form submission on Enter key in input fields
    const form = checkoutBtn.closest("form");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            checkoutBtn.click(); // Trigger our custom validation
        });
    }
});

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.style.display = "block";
    toast.style.opacity = "1";

    setTimeout(() => {
        toast.style.transition = "opacity 0.5s";
        toast.style.opacity = "0";
        setTimeout(() => {
            toast.style.display = "none";
            toast.style.transition = "none";
        }, 500);
    }, 2000);
}
