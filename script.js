const categoryTabs = document.querySelectorAll(".category-tab");
const productCards = [...document.querySelectorAll(".product-card")];
const bagButtons = document.querySelectorAll(".bag-button");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartSubtotal = document.querySelector(".cart-subtotal strong");
const checkoutButton = document.querySelector(".checkout-button");
const toast = document.querySelector(".toast");
const searchOverlay = document.querySelector(".search-overlay");
const searchInput = document.querySelector("#product-search");
const productOverlay = document.querySelector(".product-overlay");
const sizeOptions = document.querySelector(".size-options");
let cart = [];
let selectedProduct = null;
let selectedSize = "";
let productOpener = null;
let toastTimeout;

function announce(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function updateBag() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  document.querySelectorAll(".bag-count").forEach((badge) => {
    badge.textContent = count;
  });

  cartItems.innerHTML = "";
  if (!cart.length) {
    cartItems.innerHTML = '<p class="empty-cart">YOUR NEXT FAVOURITE IS WAITING.</p>';
  } else {
    cart.forEach((item) => {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <img src="${item.image}" alt="">
        <div>
          <h3>${item.name}</h3>
          <p>Size ${item.size} · Qty ${item.quantity}</p>
          <button class="remove-item" data-key="${item.key}">REMOVE</button>
        </div>
        <strong>$${item.price * item.quantity}</strong>
      `;
      cartItems.append(row);
    });
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartSubtotal.textContent = `$${total}`;
  checkoutButton.disabled = cart.length === 0;
}

function addToBag(card, size) {
  const name = card.dataset.name;
  const key = `${name}-${size}`;
  const existing = cart.find((item) => item.key === key);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      key,
      name,
      size,
      price: Number(card.dataset.price),
      image: card.querySelector("img").src,
      quantity: 1,
    });
  }
  updateBag();
  announce(`${name} added to your bag`);
}

function openProductDetails(card) {
  productOpener = document.activeElement;
  selectedProduct = card;
  selectedSize = "";
  document.querySelector(".detail-image").src = card.querySelector("img").src;
  document.querySelector(".detail-image").alt = card.querySelector("img").alt;
  document.querySelector("#detail-name").textContent = card.dataset.name;
  document.querySelector(".detail-price").textContent = `$${card.dataset.price}`;
  document.querySelector(".detail-fit").textContent = `FIT  ·  ${card.dataset.fit}`;
  document.querySelector(".detail-color").textContent = `COLOUR  ·  ${card.dataset.color}`;
  document.querySelector(".detail-fabric").textContent = `FABRIC  ·  ${card.dataset.fabric}`;
  document.querySelector(".detail-care").textContent = `CARE  ·  ${card.dataset.care}`;
  sizeOptions.replaceChildren();
  card.dataset.sizes.split(",").forEach((size) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "size-option";
    option.textContent = size;
    option.setAttribute("aria-pressed", "false");
    option.addEventListener("click", () => {
      selectedSize = size;
      sizeOptions.querySelectorAll(".size-option").forEach((button) => {
        button.classList.toggle("is-selected", button === option);
        button.setAttribute("aria-pressed", String(button === option));
      });
    });
    sizeOptions.append(option);
  });
  productOverlay.classList.add("is-open");
  productOverlay.setAttribute("aria-hidden", "false");
  document.querySelector(".product-close").focus();
}

function closeProductDetails() {
  productOverlay.classList.remove("is-open");
  productOverlay.setAttribute("aria-hidden", "true");
  selectedProduct = null;
  selectedSize = "";
  productOpener?.focus();
  productOpener = null;
}

categoryTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const category = tab.dataset.category;
    categoryTabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    productCards.forEach((card) => {
      card.hidden = category !== "all" && card.dataset.category !== category;
    });
  });
});

document.querySelectorAll(".quick-add").forEach((button) => {
  button.addEventListener("click", () => openProductDetails(button.closest(".product-card")));
});

document.querySelectorAll(".wishlist").forEach((button) => {
  button.addEventListener("click", () => {
    const saved = button.classList.toggle("is-saved");
    button.textContent = saved ? "♥" : "♡";
    button.setAttribute("aria-pressed", String(saved));
    button.setAttribute("aria-label", `${saved ? "Remove" : "Add"} ${button.closest(".product-card").dataset.name} ${saved ? "from" : "to"} wishlist`);
    announce(saved ? "Added to your wishlist" : "Removed from your wishlist");
  });
});

document.querySelector(".detail-add").addEventListener("click", () => {
  if (!selectedProduct) return;
  if (!selectedSize) {
    announce("Choose a size before adding this piece.");
    sizeOptions.querySelector(".size-option")?.focus();
    return;
  }
  addToBag(selectedProduct, selectedSize);
  closeProductDetails();
});

document.querySelector(".product-close").addEventListener("click", closeProductDetails);
document.querySelector(".product-backdrop").addEventListener("click", closeProductDetails);
productOverlay.addEventListener("click", (event) => {
  if (event.target === productOverlay) closeProductDetails();
});

bagButtons.forEach((button) => {
  button.addEventListener("click", () => {
    cartOverlay.classList.add("is-open");
    cartOverlay.setAttribute("aria-hidden", "false");
  });
});

function closeCart() {
  cartOverlay.classList.remove("is-open");
  cartOverlay.setAttribute("aria-hidden", "true");
}

document.querySelector(".cart-close").addEventListener("click", closeCart);
document.querySelector(".cart-backdrop").addEventListener("click", closeCart);

cartItems.addEventListener("click", (event) => {
  const removeButton = event.target.closest(".remove-item");
  if (!removeButton) return;
  cart = cart.filter((item) => item.key !== removeButton.dataset.key);
  updateBag();
});

document.querySelector(".checkout-button").addEventListener("click", () => {
  if (cart.length) announce("Checkout is coming soon — your bag is saved.");
});

document.querySelector(".search-toggle").addEventListener("click", () => {
  searchOverlay.classList.add("is-open");
  searchOverlay.setAttribute("aria-hidden", "false");
  window.setTimeout(() => searchInput.focus(), 100);
});

function closeSearch() {
  searchOverlay.classList.remove("is-open");
  searchOverlay.setAttribute("aria-hidden", "true");
  searchInput.value = "";
  productCards.forEach((card) => { card.hidden = false; });
}

document.querySelector(".search-close").addEventListener("click", closeSearch);
searchOverlay.addEventListener("click", (event) => {
  if (event.target === searchOverlay) closeSearch();
});
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  const results = document.querySelector(".search-results");
  results.replaceChildren();
  if (!query) return;
  const matches = productCards.filter((card) => card.dataset.name.toLowerCase().includes(query));
  if (!matches.length) {
    results.innerHTML = '<p class="search-empty">NO PIECES FOUND. TRY ANOTHER SEARCH.</p>';
    return;
  }
  matches.forEach((card) => {
    const result = document.createElement("button");
    result.className = "search-result";
    result.innerHTML = `<span>${card.dataset.name}</span><span>$${card.dataset.price} ↗</span>`;
    result.addEventListener("click", () => {
      categoryTabs.forEach((tab) => {
        const active = tab.dataset.category === "all";
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-pressed", String(active));
      });
      closeSearch();
      productCards.forEach((product) => {
        product.hidden = product !== card;
      });
      document.querySelector("#shop").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    results.append(result);
  });
});

document.querySelector(".menu-toggle").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const nav = document.querySelector(".main-nav");
  const isOpen = nav.classList.toggle("is-open");
  button.setAttribute("aria-expanded", String(isOpen));
  button.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelector(".main-nav").classList.remove("is-open");
    document.querySelector(".menu-toggle").setAttribute("aria-expanded", "false");
  });
});

document.querySelector(".newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  document.querySelector(".newsletter-feedback").textContent = "Thanks for your interest. Connect a mailing-list service to save sign-ups before launch.";
  event.currentTarget.reset();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCart();
    closeSearch();
    closeProductDetails();
    document.querySelector(".main-nav").classList.remove("is-open");
    document.querySelector(".menu-toggle").setAttribute("aria-expanded", "false");
  }
});

updateBag();
