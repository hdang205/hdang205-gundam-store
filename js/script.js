const STORAGE_KEYS = {
  users: "gunpla_users",
  session: "gunpla_session",
  orders: "gunpla_orders",
  guestCart: "gunpla_guest_cart",
  guestWishlist: "gunpla_guest_wishlist",
};

const PRODUCTS_FILE_PATH = "js/products.json";

function cloneProductsData(products) {
  return JSON.parse(JSON.stringify(products || []));
}

let fallbackProducts = []; async function loadFallbackProducts() { try { const res = await fetch(PRODUCTS_FILE_PATH); if (res.ok) { fallbackProducts = await res.json(); } } catch (e) { console.error("Could not load products.json fallback", e); } }

let allProducts = [];
let activeCategory = "ALL";
let activeSearch = "";
let currentDetailProduct = null;

// Developer helper: set this to true during development to always clear product cache on load
const DEV_AUTO_RESET = false;

function byId(id) {
  return document.getElementById(id);
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatVnd(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function showToast(message) {
  let toast = byId("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }

  toast.innerHTML = message;
  toast.style.opacity = 1;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.style.opacity = 0;
  }, 2400);
}

function hideLoader() {
  const loader = byId("loader");
  if (loader) {
    setTimeout(() => {
      loader.style.display = "none";
    }, 700);
  }
}

function initCursorEffect() {
  let glow = byId("cursorGlow");
  if (!glow) {
    glow = document.createElement("div");
    glow.id = "cursorGlow";
    document.body.appendChild(glow);
  }

  window.addEventListener("mousemove", (event) => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  });
}

function initRevealObserver() {
  const items = document.querySelectorAll(
    "section, .category-card, .product-card, .promo-banner, .detail-card, .review-card, .stat-card, .chart-card",
  );
  items.forEach((item) => item.classList.add("reveal"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  document
    .querySelectorAll(".reveal")
    .forEach((item) => observer.observe(item));
}

function initHeroSlider() {
  const slides = document.querySelectorAll(".slide");
  if (slides.length < 2) return;

  let current = 0;
  setInterval(() => {
    slides[current].classList.remove("active");
    current = (current + 1) % slides.length;
    slides[current].classList.add("active");
  }, 5200);
}

function initParallax() {
  const hero = document.querySelector(".hero");
  const parallaxTarget = document.querySelector(".hero-slider img");
  if (!hero || !parallaxTarget) return;

  hero.addEventListener("mousemove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    parallaxTarget.style.transform = `translate(${x * -16}px, ${y * -12}px) scale(1.08)`;
  });

  hero.addEventListener("mouseleave", () => {
    parallaxTarget.style.transform = "translate(0, 0) scale(1.08)";
  });
}

function removeSampleStaffAccounts() {
  const users = getUsers();
  const filteredUsers = users.filter(user =>
    user.email !== "staff.kho@gmail.com" &&
    user.email !== "staff.tuvan@gmail.com" &&
    user.email !== "staff.cskh@gmail.com"
  );

  if (filteredUsers.length < users.length) {
    writeJSON(STORAGE_KEYS.users, filteredUsers);
    console.log("Sample staff accounts removed.");
  }
}

function seedData() {
  const users = readJSON(STORAGE_KEYS.users, []);
  if (!users.some((user) => user.email === "admin@gmail.com")) {
    users.push({
      id: `u-${Date.now()}`,
      name: "Admin",
      email: "admin@gmail.com",
      password: "admin123",
      role: "admin",
    });
    writeJSON(STORAGE_KEYS.users, users);
  }
}

function getCurrentUser() {
  return readJSON(STORAGE_KEYS.session, null);
}

function setCurrentUser(user) {
  if (user) {
    writeJSON(STORAGE_KEYS.session, user);
  } else {
    localStorage.removeItem(STORAGE_KEYS.session);
  }
}

function getProducts() {
  if (Array.isArray(allProducts) && allProducts.length) {
    return allProducts;
  }
  return fallbackProducts;
}

function setProducts(products) {
  allProducts = cloneProductsData(products);
  window.products = allProducts;
}

function resetProducts() {
  setProducts(fallbackProducts);
  showToast("Đã reset dữ liệu sản phẩm");
  try {
    renderProductsGrid();
    initAdminPage();
  } catch (e) {
    // ignore if pages not present
  }
}

window.resetProducts = resetProducts;

function applyDevReset() {
  try {
    const flag = localStorage.getItem("gunpla_dev_reset");
    if (DEV_AUTO_RESET || flag === "1") {
      try {
        resetProducts();
      } catch (e) {
        // ignore
      }
      // expose a helper for convenience
      window.disableDevReset = () =>
        localStorage.removeItem("gunpla_dev_reset");
      window.enableDevReset = () =>
        localStorage.setItem("gunpla_dev_reset", "1");
    }
  } catch (err) {
    // ignore
  }
}

function getUsers() {
  return readJSON(STORAGE_KEYS.users, []);
}

function setUsers(users) {
  writeJSON(STORAGE_KEYS.users, users);
}

function getOrders() {
  return readJSON(STORAGE_KEYS.orders, []);
}

function setOrders(orders) {
  writeJSON(STORAGE_KEYS.orders, orders);
}

function getGuestCart() {
  return readJSON(STORAGE_KEYS.guestCart, []);
}

function setGuestCart(items) {
  writeJSON(STORAGE_KEYS.guestCart, items);
}

function getGuestWishlist() {
  return readJSON(STORAGE_KEYS.guestWishlist, []);
}

function setGuestWishlist(ids) {
  writeJSON(STORAGE_KEYS.guestWishlist, ids);
}

function getCartKey() {
  const currentUser = getCurrentUser();
  return currentUser ? `gunpla_cart_${currentUser.id}` : STORAGE_KEYS.guestCart;
}

function getWishlistKey() {
  const currentUser = getCurrentUser();
  return currentUser
    ? `gunpla_wishlist_${currentUser.id}`
    : STORAGE_KEYS.guestWishlist;
}

function getCartItems() {
  return readJSON(getCartKey(), []);
}

function setCartItems(items) {
  writeJSON(getCartKey(), items);
}

function getWishlistIds() {
  return readJSON(getWishlistKey(), []);
}

function setWishlistIds(ids) {
  writeJSON(getWishlistKey(), ids);
}

function initMenuInteractions() {
  const mobileMenu = document.querySelector(".mobile-menu");
  const navLinks = document.querySelector(".nav-links");
  if (mobileMenu && navLinks) {
    mobileMenu.addEventListener("click", () =>
      navLinks.classList.toggle("active"),
    );
  }

  const toggleBtn = byId("themeToggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("light-mode");
      const isLight = document.body.classList.contains("light-mode");
      try {
        localStorage.setItem("theme", isLight ? "light" : "dark");
      } catch (e) {}
      const icon = toggleBtn.querySelector("i");
      if (icon) {
        if (document.body.classList.contains("light-mode")) {
          icon.className = "fas fa-sun";
        } else {
          icon.className = "fas fa-moon";
        }
      }
    });
  }

  const userDropdown = document.querySelector(".user-dropdown");
  const userIcon = document.querySelector(".user-icon");
  if (userDropdown && userIcon) {
    const closeDropdown = () => userDropdown.classList.remove("open");

    const toggleDropdown = (event) => {
      event.preventDefault();
      event.stopPropagation();
      userDropdown.classList.toggle("open");
      userIcon.setAttribute(
        "aria-expanded",
        String(userDropdown.classList.contains("open")),
      );
    };

    userIcon.setAttribute("role", "button");
    userIcon.setAttribute("tabindex", "0");
    userIcon.setAttribute("aria-expanded", "false");

    userIcon.addEventListener("click", toggleDropdown);
    userIcon.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        toggleDropdown(event);
      }
    });

    // Prevent clicks inside the dropdown from closing it
    userDropdown.addEventListener("mousedown", (event) => {
      event.stopPropagation();
    });

    document.addEventListener("click", (event) => {
      if (!userDropdown.contains(event.target)) {
        closeDropdown();
        userIcon.setAttribute("aria-expanded", "false");
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) {
        userDropdown.classList.remove("open");
        userIcon.setAttribute("aria-expanded", "false");
      }
    });
  }
}

function renderHeaderUserState() {
  const dropdown = document.querySelector(".dropdown-menu");
  if (!dropdown) {
    // If header is not yet loaded by include-header.js, retry in 100ms
    setTimeout(renderHeaderUserState, 100);
    return;
  }

  const currentUser = getCurrentUser();
  if (!currentUser) {
    dropdown.innerHTML = `
      <a href="login.html"><i class="fas fa-right-to-bracket"></i> Đăng nhập</a>
      <a href="register.html"><i class="fas fa-user-plus"></i> Đăng ký</a>
      <a href="user.html"><i class="fas fa-id-card"></i> Hồ sơ</a>
    `;
    return;
  }

  const roleLabel = currentUser.role === "admin" ? "Quản trị" : "Nhân viên";

  dropdown.innerHTML = `
    <a href="user.html"><i class="fas fa-id-card"></i> ${currentUser.email}</a>
    ${(currentUser.role === "admin" || currentUser.role === "staff") ? `<a href="admin.html"><i class="fas fa-shield"></i> ${roleLabel}</a>` : ""}
    <a href="#" id="logoutLink"><i class="fas fa-right-from-bracket"></i> Đăng xuất</a>
  `;

  const logoutLink = byId("logoutLink");
  if (logoutLink) {
    logoutLink.addEventListener("click", (event) => {
      event.preventDefault();
      setCurrentUser(null);
      showToast("Đã đăng xuất");
      setTimeout(() => (window.location.href = "index.html"), 500);
    });
  }
}

async function loadProductsData() {
  if (!fallbackProducts.length) {
    await loadFallbackProducts();
  }

  try {
    const data = await api.getProducts();
    if (Array.isArray(data) && data.length) {
      // Map MongoDB _id to id for frontend compatibility
      return data.map((p) => ({
        ...p,
        id: p.id || p._id,
      }));
    }
  } catch (error) {
    console.error("API Error loading products:", error);
  }
  return cloneProductsData(fallbackProducts);
}

function productLoadingMarkup() {
  return `
    <div class="loading-grid">
      <div class="skeleton"></div>
      <div class="skeleton"></div>
      <div class="skeleton"></div>
      <div class="skeleton"></div>
    </div>
  `;
}

function badgeMarkup(product) {
  return `
    <div class="badge badge-${String(product.badge || "sale").toLowerCase()}">${product.badge || "Sale"}</div>
  `;
}

function matchesPageCategory(product, category) {
  const target = String(category || "ALL").toUpperCase();
  if (target === "ALL") return true;

  const productCategory = String(product.category || "").toUpperCase();
  const productName = String(product.name || "").toUpperCase();

  if (target === "RG_PG") {
    return (
      productCategory === "RG" ||
      productCategory === "PG" ||
      productName.startsWith("RG ") ||
      productName.startsWith("PG ")
    );
  }

  if (target === "TOOLS") {
    return (
      productCategory === "TOOLS" ||
      productName.includes("TOOL") ||
      productName.includes("DỤNG CỤ")
    );
  }

  if (target === "PAINT") {
    return (
      productCategory === "PAINT" ||
      productName.includes("PAINT") ||
      productName.includes("SƠN") ||
      productName.includes("DECAL")
    );
  }

  return productCategory === target || productName.startsWith(`${target} `);
}

function productCardTemplate(product) {
  const liked = getWishlistIds().includes(product.id);
  return `
    <div class="product-card reveal" data-product-id="${product.id}">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        ${badgeMarkup(product)}
        <h3>${product.name}</h3>
        <p class="category-badge">${product.category || "Gunpla"}</p>
        <div class="price">
          <span class="old">${formatVnd(product.oldPrice || product.price)}</span>
          <span class="new">${formatVnd(product.price)}</span>
        </div>
        <div class="rating">★★★★★</div>
        <div class="product-actions">
          <button class="cart-btn" data-action="cart">Thêm vào giỏ</button>
          <button class="detail-btn" data-action="detail">Chi tiết</button>
          <button class="wish-btn ${liked ? "active" : ""}" data-action="wish">❤</button>
        </div>
      </div>
    </div>
  `;
}

function relatedProductCard(product) {
  return `
    <article class="detail-card reveal">
      <img src="${product.image}" alt="${product.name}" style="border-radius:18px; margin-bottom:12px;">
      <h4>${product.name}</h4>
      <p>${formatVnd(product.price)}</p>
    </article>
  `;
}

function initQuickModal() {
  const modal = byId("quickModal");
  const body = byId("modalBody");
  const closeBtn = document.querySelector(".close-modal");
  if (!modal || !body || !closeBtn) return;

  closeBtn.addEventListener("click", () => (modal.style.display = "none"));
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.style.display = "none";
  });
}

function openProductModal(product) {
  const modal = byId("quickModal");
  const body = byId("modalBody");
  if (!modal || !body) return;

  body.innerHTML = `
    <img src="${product.image}" alt="${product.name}" style="width:100%; border-radius:18px; margin-bottom:14px;">
    <h2>${product.name}</h2>
    <p style="margin:10px 0; color: rgba(255,255,255,.72)">${product.description || ""}</p>
    <p><b>Danh mục:</b> ${product.category || "Gunpla"}</p>
    <p><b>Giá:</b> ${formatVnd(product.price)}</p>
  `;
  modal.style.display = "grid";
}

function renderProductsGrid() {
  const grid = byId("productGrid");
  if (!grid) return;

  const filtered = allProducts.filter((product) => {
    const byCategory = matchesPageCategory(product, activeCategory);
    const haystack =
      `${product.name} ${product.description || ""} ${product.category || ""} ${product.badge || ""}`.toLowerCase();
    return byCategory && haystack.includes(activeSearch);
  });

  grid.innerHTML = filtered.map(productCardTemplate).join("");
  grid.querySelectorAll(".product-card").forEach((card, index) => {
    setTimeout(() => card.classList.add("visible"), index * 80);
  });
  grid.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", (event) => {
      const action = event.target?.dataset?.action;
      if (!action) return;
      const product = allProducts.find(
        (item) => item.id === card.dataset.productId,
      );
      if (!product) return;

      if (action === "cart") {
        addToCart(product);
      }
      if (action === "wish") {
        toggleWishlist(product);
        renderProductsGrid();
      }
      if (action === "detail") {
        window.location.href = `product-detail.html?id=${encodeURIComponent(
          product.id,
        )}`;
      }
    });
  });
}

function initProductsPage() {
  const grid = byId("productGrid");
  if (!grid) return;

  const pageCategory = document.body.dataset.category;
  if (pageCategory) {
    activeCategory = pageCategory.toUpperCase();
  }

  if (!allProducts.length) {
    grid.innerHTML = productLoadingMarkup();
  }

  const searchInput = byId("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      activeSearch = event.target.value.trim().toLowerCase();
      renderProductsGrid();
    });
  }

  document.querySelectorAll("[data-filter]").forEach((chip) => {
    chip.addEventListener("click", () => {
      activeCategory = chip.dataset.filter;
      document
        .querySelectorAll("[data-filter]")
        .forEach((item) => item.classList.remove("active"));
      chip.classList.add("active");
      renderProductsGrid();
    });
  });
}

function toggleWishlist(product) {
  const ids = getWishlistIds();
  const next = ids.includes(product.id)
    ? ids.filter((id) => id !== product.id)
    : [...ids, product.id];
  setWishlistIds(next);
  showToast(
    ids.includes(product.id)
      ? "Đã xóa khỏi Mục Yêu Thích "
      : "Đã thêm vào Mục Yêu Thích ",
  );
}

function addToCart(product, quantity = 1) {
  const cart = getCartItems();
  const found = cart.find((item) => item.product.id === product.id);
  if (found) found.quantity += quantity;
  else cart.push({ product, quantity });
  setCartItems(cart);
  showToast("Đã thêm vào giỏ hàng");
}

function updateCartQuantity(productId, quantity) {
  const cart = getCartItems();
  const found = cart.find((item) => item.product.id === productId);
  if (!found || quantity < 1) return;
  found.quantity = quantity;
  setCartItems(cart);
}

function removeCartItem(productId) {
  setCartItems(getCartItems().filter((item) => item.product.id !== productId));
}

function renderCartPage() {
  const root = byId("cartRoot");
  if (!root) return;

  const items = getCartItems();
  if (!items.length) {
    root.innerHTML = `
      <div class="empty-box">
        <h3>Giỏ hàng đang trống</h3>
        <p>Hãy chọn vài mẫu Gundam thật chất để bắt đầu.</p>
        <a class="btn-primary inline-btn" href="products.html"
          style="display: inline-block; text-decoration: none"
        >Mua ngay</a>
      </div>
    `;
    return;
  }

  const total = items.reduce(
    (sum, item) => sum + Number(item.product.price) * Number(item.quantity),
    0,
  );

  root.innerHTML = `
    ${items
      .map(
        (item) => `
          <article class="cart-item" data-product-id="${item.product.id}">
            <img src="${item.product.image}" alt="${item.product.name}">
            <div>
              <h3>${item.product.name}</h3>
              <p>${formatVnd(item.product.price)}</p>
              <div class="qty-actions">
                <button data-q="minus">-</button>
                <span>${item.quantity}</span>
                <button data-q="plus">+</button>
                <button data-q="remove">Xóa</button>
              </div>
            </div>
            <strong>${formatVnd(Number(item.product.price) * Number(item.quantity))}</strong>
          </article>
        `,
      )
      .join("")}
    <div class="cart-summary">
      <div>
        <h3>Tổng cộng</h3>
        <p>${formatVnd(total)}</p>
      </div>
      <a class="btn-primary inline-btn" href="checkout.html">Thanh toán</a>
    </div>
  `;

  root.querySelectorAll(".cart-item").forEach((itemNode) => {
    itemNode.addEventListener("click", (event) => {
      const action = event.target?.dataset?.q;
      if (!action) return;
      const productId = itemNode.dataset.productId;
      const item = items.find((entry) => entry.product.id === productId);
      if (!item) return;

      if (action === "minus") updateCartQuantity(productId, item.quantity - 1);
      if (action === "plus") updateCartQuantity(productId, item.quantity + 1);
      if (action === "remove") removeCartItem(productId);
      renderCartPage();
    });
  });
}

function renderProductDetailPage() {
  const root = document.querySelector(".product-detail");
  if (!root) return;

  const id =
    new URLSearchParams(window.location.search).get("id") ||
    getProducts()[0]?.id;
  const product =
    getProducts().find((item) => item.id === id) || getProducts()[0];
  if (!product) return;
  currentDetailProduct = product;

  const gallery = product.gallery || [product.image];
  root.innerHTML = `
    <div class="gallery-block">
      <div class="gallery-main">
        <img id="detailMainImage" src="${gallery[0]}" alt="${product.name}">
      </div>
      <div class="thumbs" id="detailThumbs">
        ${gallery
          .map(
            (img, index) => `
              <img class="${index === 0 ? "active" : ""}" src="${img}" data-index="${index}" alt="thumb">
            `,
          )
          .join("")}
      </div>
    </div>
    <div class="detail-info">
      <span class="stock-pill">${product.stock || "Còn hàng"}</span>
      ${badgeMarkup(product)}
      <h1>${product.name}</h1>
      <div class="rating">★★★★★</div>
      <div class="detail-price">${formatVnd(product.price)}</div>
      <p>${product.description || ""}</p>
      <div class="spec-grid">
        ${Object.entries(product.specs || {})
          .map(
            ([key, value]) =>
              `<div class="spec-item"><strong>${key}</strong><br>${value}</div>`,
          )
          .join("")}
      </div>
      <div class="quantity-box">
        <button type="button" data-step="minus">-</button>
        <span id="detailQty">1</span>
        <button type="button" data-step="plus">+</button>
      </div>
      <button class="btn-primary" id="detailAddCart">Thêm vào giỏ</button>
      <button class="btn-secondary" id="detailWish" style="margin-left:10px;">Yêu thích</button>
    </div>
    <div class="detail-card" style="grid-column:1/-1; margin-top:8px;">
      <h3>Đánh giá khách hàng</h3>
      <div class="review-grid" style="margin-top:14px;">
        ${
          (product.reviews || []).length
            ? product.reviews
                .map(
                  (review) => `
                  <article class="review-card">
                    <strong>${review.name}</strong>
                    <div class="rating">${"★".repeat(review.rating || 5)}</div>
                    <p>${review.text}</p>
                  </article>
                `,
                )
                .join("")
            : `<div class="review-card"><p>Chưa có đánh giá cho sản phẩm này.</p></div>`
        }
      </div>
    </div>
    <div class="detail-card" style="grid-column:1/-1; margin-top:8px;">
      <h3>Sản phẩm liên quan</h3>
      <div class="related-grid" style="margin-top:14px;">
        ${getProducts()
          .filter(
            (item) =>
              item.category === product.category && item.id !== product.id,
          )
          .slice(0, 4)
          .map(relatedProductCard)
          .join("")}
      </div>
    </div>
  `;

  requestAnimationFrame(() => {
    root
      .querySelectorAll(".reveal")
      .forEach((item) => item.classList.add("visible"));
  });

  const mainImage = byId("detailMainImage");
  const thumbs = document.querySelectorAll("#detailThumbs img");
  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      thumbs.forEach((item) => item.classList.remove("active"));
      thumb.classList.add("active");
      if (mainImage) mainImage.src = thumb.src;
    });
  });

  let qty = 1;
  const qtyLabel = byId("detailQty");
  root.querySelectorAll("[data-step]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.step === "minus") qty = Math.max(1, qty - 1);
      if (button.dataset.step === "plus") qty += 1;
      if (qtyLabel) qtyLabel.textContent = String(qty);
    });
  });

  byId("detailAddCart")?.addEventListener("click", () =>
    addToCart(product, qty),
  );
  byId("detailWish")?.addEventListener("click", () => toggleWishlist(product));

  mainImage?.addEventListener("click", () => {
    openProductModal(product);
  });
}

function renderCheckoutPage() {
  const form = byId("checkoutForm");
  if (!form) return;

  const couponInput = byId("couponCode");
  const summaryEl = byId("checkoutSummary");
  const loadingEl = byId("checkoutLoading");
  const preview = () => {
    const items = getCartItems();
    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.product.price) * Number(item.quantity),
      0,
    );
    let discount = 0;
    const coupon = (couponInput?.value || "").trim().toUpperCase();
    if (coupon === "GUNPLA10") discount = Math.round(subtotal * 0.1);
    if (coupon === "NEON20") discount = Math.round(subtotal * 0.2);
    if (summaryEl) {
      summaryEl.innerHTML = `
        <p>Tạm tính: <b>${formatVnd(subtotal)}</b></p>
        <p>Giảm giá: <b>- ${formatVnd(discount)}</b></p>
        <p>Tổng: <b>${formatVnd(subtotal - discount)}</b></p>
      `;
    }
  };

  couponInput?.addEventListener("input", preview);
  preview();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const items = getCartItems();
    if (!items.length) {
      showToast("Giỏ hàng đang trống");
      return;
    }

    const fullName = byId("fullName")?.value.trim();
    const phone = byId("phone")?.value.trim();
    const address = byId("address")?.value.trim();
    const note = byId("note")?.value.trim() || "";
    const paymentMethod = byId("paymentMethod")?.value || "COD";
    const couponCode = (couponInput?.value || "").trim().toUpperCase();

    if (!fullName || !phone || !address) {
      showToast("Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    if (loadingEl) loadingEl.style.display = "grid";

    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.product.price) * Number(item.quantity),
      0,
    );
    const discount =
      couponCode === "GUNPLA10"
        ? Math.round(subtotal * 0.1)
        : couponCode === "NEON20"
          ? Math.round(subtotal * 0.2)
          : 0;
    const total = subtotal - discount;
    const orders = getOrders();
    const currentUser = getCurrentUser();

    setTimeout(() => {
      orders.unshift({
        id: `order-${Date.now()}`,
        userId: currentUser?.id || null,
        customer: {
          fullName,
          phone,
          address,
          note,
          email: currentUser?.email || null,
        },
        paymentMethod,
        paymentStatus: paymentMethod === "COD" ? "UNPAID" : "PENDING",
        orderStatus: "NEW",
        items,
        subtotal,
        discount,
        total,
        createdAt: new Date().toISOString(),
      });
      setOrders(orders);
      setCartItems([]);
      if (loadingEl) loadingEl.style.display = "none";
      showToast("Đặt hàng thành công");
      setTimeout(() => (window.location.href = "user.html"), 1000);
    }, 1200);
  });
}

function initAuthForms() {
  const loginForm = byId("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = byId("loginEmail")?.value.trim().toLowerCase();
      const password = byId("loginPassword")?.value;

      try {
        const result = await api.login(email, password);
        if (result.token) {
          setCurrentUser(result);
          showToast("Đăng nhập thành công");
          setTimeout(() => (window.location.href = "index.html"), 700);
        } else {
          showToast(result.message || "Sai email hoặc mật khẩu");
        }
      } catch (error) {
        showToast("Lỗi kết nối máy chủ");
      }
    });
  }

  const registerForm = byId("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = byId("registerName")?.value.trim();
      const email = byId("registerEmail")?.value.trim().toLowerCase();
      const password = byId("registerPassword")?.value;
      const confirm = byId("confirmPassword")?.value;

      if (!name || !email || !password)
        return showToast("Vui lòng nhập đầy đủ thông tin");
      if (password !== confirm) return showToast("Mật khẩu không khớp");

      try {
        const result = await api.register(name, email, password);
        if (result.token) {
          setCurrentUser(result);
          showToast("Tạo tài khoản thành công");
          setTimeout(() => (window.location.href = "index.html"), 700);
        } else {
          showToast(result.message || "Lỗi đăng ký");
        }
      } catch (error) {
        showToast("Lỗi kết nối máy chủ");
      }
    });
  }
}

function renderUserPage() {
  const profileName = byId("profileName");
  const profileEmail = byId("profileEmail");
  const profileAvatar = byId("profileAvatar");
  const orderList = byId("orderList");
  const wishlistList = byId("wishlistList");
  const loginButton = byId("loginButton");
  const passwordForm = byId("changePasswordForm");
  const darkModeToggle = byId("darkModeToggle");
  const uploadAvatarBtn = byId("uploadAvatarBtn");
  const avatarInput = byId("avatarInput");

  if (!profileName || !profileEmail || !orderList || !wishlistList) return;

  const currentUser = getCurrentUser();
  if (!currentUser) {
    profileName.textContent = "Khach";
    profileEmail.textContent = "Hãy đăng nhập để xem dữ liệu";
    orderList.innerHTML = "<li>Chưa có đơn hàng.</li>";
    wishlistList.innerHTML = "<li>Mục yêu thích trống.</li>";
    loginButton && (loginButton.style.display = "inline-flex");
    if (uploadAvatarBtn) uploadAvatarBtn.style.display = "none";
    return;
  }

  if (loginButton) loginButton.style.display = "none";
  if (uploadAvatarBtn) uploadAvatarBtn.style.display = "flex";

  profileName.textContent = currentUser.name || "Thành viên Gundam";
  profileEmail.textContent = currentUser.email;

  // Set avatar if exists
  if (profileAvatar && currentUser.avatar) {
    profileAvatar.src = currentUser.avatar;
  }

  // Load orders from API
  api
    .getMyOrders()
    .then((orders) => {
      if (Array.isArray(orders) && orders.length) {
        orderList.innerHTML = orders
          .map(
            (o) => `
        <li class="order-item" style="cursor: pointer; padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
          <div style="display:flex; justify-content: space-between;">
            <div>
              <strong>Đơn hàng #${o._id.slice(-6).toUpperCase()}</strong>
              <p style="font-size: 0.8em; color: #a0aec0;">${new Date(o.createdAt).toLocaleDateString()}</p>
            </div>
            <div style="text-align: right;">
              <p><b>${formatVnd(o.totalPrice)}</b></p>
              <span class="status-badge status-${o.status}">${o.status.toUpperCase()}</span>
            </div>
          </div>
          <div class="order-details" style="display:none; margin-top: 10px; font-size: 0.9em; color: rgba(255,255,255,0.7);">
            ${o.orderItems ? o.orderItems.map((item) => `<div>${item.name} x ${item.qty}</div>`).join("") : ""}
          </div>
        </li>
      `,
          )
          .join("");

        // Toggle order details
        orderList.querySelectorAll(".order-item").forEach((item) => {
          item.addEventListener("click", () => {
            const details = item.querySelector(".order-details");
            if (details) {
              details.style.display =
                details.style.display === "none" ? "block" : "none";
            }
          });
        });
      } else {
        orderList.innerHTML = "<li>Chưa có đơn hàng nào.</li>";
      }
    })
    .catch((err) => {
      orderList.innerHTML = "<li>Lỗi khi tải đơn hàng.</li>";
    });

  // Handle avatar upload
  uploadAvatarBtn?.addEventListener("click", () => avatarInput?.click());
  avatarInput?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      showToast("Đang tải ảnh...");
      const res = await fetch("/api/users/upload-avatar", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const result = await res.json();

      // Update user in session and local storage
      currentUser.avatar = result.path;
      setCurrentUser(currentUser);

      const users = getUsers();
      const idx = users.findIndex((u) => u.id === currentUser.id);
      if (idx !== -1) {
        users[idx].avatar = result.path;
        setUsers(users);
      }

      if (profileAvatar) profileAvatar.src = result.path;
      showToast("Cập nhật ảnh đại diện thành công");
    } catch (err) {
      showToast("Lỗi khi tải ảnh: " + err.message);
    }
  });


  const wishIds = getWishlistIds();
  const wishProducts = getProducts().filter((item) =>
    wishIds.includes(item.id),
  );
  wishlistList.innerHTML = wishProducts.length
    ? wishProducts
        .map(
          (item) =>
            `<li style="display:flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
          <span>${item.name}</span>
          <div>
            <button class="btn-ghost" onclick="window.location.href='product-detail.html?id=${encodeURIComponent(item.id)}'" style="padding: 5px 10px;">Xem</button>
            <button class="btn-primary" data-action="add-cart" data-id="${item.id}" style="padding: 5px 10px; margin-left:10px;">Thêm vào giỏ</button>
            <button class="btn-danger" data-wish-id="${item.id}" style="padding: 5px 10px; margin-left:10px;">Xóa</button>
          </div>
        </li>`,
        )
        .join("")
    : "<li>Mục yêu thích trống.</li>";

  // Handle wishlist actions
  wishlistList.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.wishId || btn.dataset.id;
      if (btn.classList.contains("btn-danger")) {
        const next = getWishlistIds().filter((wid) => wid !== id);
        setWishlistIds(next);
        renderUserPage();
        showToast("Đã xóa khỏi mục yêu thích");
      } else if (btn.dataset.action === "add-cart") {
        const product = getProducts().find((p) => p.id === id);
        if (product) {
          addToCart(product);
        }
      }
    });
  });

  darkModeToggle?.addEventListener("click", () =>
    document.body.classList.toggle("light-mode"),
  );

  passwordForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const oldPassword = byId("oldPassword")?.value;
    const newPassword = byId("newPassword")?.value;
    const confirmPassword = byId("confirmNewPassword")?.value;
    const users = getUsers();
    const index = users.findIndex((item) => item.id === currentUser.id);
    if (index < 0) return;
    if (users[index].password !== oldPassword)
      return showToast("Mật khẩu cũ không đúng");
    if (newPassword !== confirmPassword)
      return showToast("Mật khẩu mới không khớp");
    users[index].password = newPassword;
    setUsers(users);
    showToast("Đổi mật khẩu thành công");
    passwordForm.reset();
  });
}

function drawNewRevenueChart(canvasId, orders) {
  const canvas = byId(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const W = rect.width;
  const H = rect.height;
  const PAD = { t: 30, r: 20, b: 45, l: 60 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  ctx.clearRect(0, 0, W, H);

  // Radial gradient nền
  const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.7);
  bg.addColorStop(0, "rgba(0,229,255,0.04)");
  bg.addColorStop(1, "rgba(255,53,93,0.02)");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Nhóm orders thành 6 bucket
  const buckets = Array.from({ length: 6 }, (_, i) =>
    orders.slice(i * 4, (i + 1) * 4).reduce((s, o) => s + Number(o.total || 0), 0)
  );
  const max = Math.max(...buckets, 1);
  const barW = Math.min(chartW / buckets.length * 0.6, 50);
  const gap = barW * 0.5;
  const totalW = buckets.length * (barW + gap) - gap;
  const startX = PAD.l + (chartW - totalW) / 2;

  // Lưới ngang
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  for (let i = 0; i <= 4; i++) {
    const y = PAD.t + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(PAD.l, y);
    ctx.lineTo(W - PAD.r, y);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(formatVnd(Math.round(max * (1 - i / 4))), PAD.l - 8, y);
  }
  ctx.setLineDash([]);

  // Vẽ cột
  const tooltipData = [];
  const labels = ["4 ngày đầu", "4-8", "8-12", "12-16", "16-20", "20-24"];
  buckets.forEach((val, i) => {
    const barH = val > 0 ? Math.max((val / max) * chartH, 4) : 0;
    const x = startX + i * (barW + gap);
    const y = PAD.t + chartH - barH;

    ctx.shadowColor = "rgba(0,229,255,0.4)";
    ctx.shadowBlur = 14;

    const grd = ctx.createLinearGradient(0, y, 0, y + barH);
    grd.addColorStop(0, "#00e5ff");
    grd.addColorStop(0.5, "#7c3aed");
    grd.addColorStop(1, "#ff355d");
    ctx.fillStyle = grd;

    const r = 4;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + barW - r, y);
    ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
    ctx.lineTo(x + barW, y + barH - r);
    ctx.quadraticCurveTo(x + barW, y + barH, x + barW - r, y + barH);
    ctx.lineTo(x + r, y + barH);
    ctx.quadraticCurveTo(x, y + barH, x, y + barH - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    if (val > 0) {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      const v = formatVnd(val);
      ctx.fillText(v, x + barW / 2, y - 6);
    }

    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "9px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(labels[i] || `Dot ${i + 1}`, x + barW / 2, PAD.t + chartH + 6);

    tooltipData.push({ x, y, w: barW, h: barH, val, label: labels[i] });
  });

  // Line xu hướng
  const positive = buckets.filter(v => v > 0);
  if (positive.length >= 2) {
    ctx.strokeStyle = "rgba(0,229,255,0.25)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    const pts = [];
    buckets.forEach((val, i) => {
      if (val > 0) {
        const barH = (val / max) * chartH;
        const x = startX + i * (barW + gap) + barW / 2;
        const y = PAD.t + chartH - barH;
        pts.push({ x, y });
      }
    });
    if (pts.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let j = 1; j < pts.length; j++) ctx.lineTo(pts[j].x, pts[j].y);
      ctx.stroke();
      pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#00e5ff";
        ctx.fill();
      });
    }
    ctx.setLineDash([]);
  }

  // Tooltip
  canvas.onmousemove = (e) => {
    const r2 = canvas.getBoundingClientRect();
    const mx = e.clientX - r2.left;
    const my = e.clientY - r2.top;
    const hit = tooltipData.find(d => mx >= d.x && mx <= d.x + d.w && my >= d.y - 10 && my <= d.y + d.h + 10);
    canvas.title = hit ? `${hit.label}: ${formatVnd(hit.val)}` : "";
    canvas.style.cursor = hit ? "pointer" : "default";
  };

  // ResizeObserver cho responsive
  const container = canvas.parentElement;
  if (!canvas.dataset.inited) {
    canvas.dataset.inited = "1";
    const ro = new ResizeObserver(() => drawNewRevenueChart(canvasId, orders));
    ro.observe(container);
  }
}

async function loadAvailableImages() {
  const select = byId("adminImage");
  if (!select) return;

  try {
    const res = await fetch("/api/images/products");
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    select.innerHTML = '<option value="">-- Chọn ảnh có sẵn --</option>';
    (data.images || []).forEach((img) => {
      const opt = document.createElement("option");
      opt.value = `images/products/${img}`;
      opt.textContent = img;
      select.appendChild(opt);
    });
  } catch (error) {
    console.warn(
      "Could not load images from API. Backend may not be running.",
      error,
    );
    select.innerHTML = '<option value="">-- Nhập đường dẫn ảnh --</option>';
  }
}

async function uploadProductImage() {
  try {
    const fileInput = byId("adminImageUpload");
    if (!fileInput?.files?.[0]) {
      return showToast("Vui lòng chọn ảnh");
    }
    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("/api/images/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");
    const result = await res.json();

    const select = byId("adminImage");
    if (select) {
      select.value = result.path;
    }
    fileInput.value = "";
    showToast("Upload thành công!");
    await loadAvailableImages();
  } catch (error) {
    showToast(`Upload lỗi: ${error.message}`);
  }
}

function initAdminPage() {
  const adminRoot = byId("adminRoot");
  if (!adminRoot) return;

  const currentUser = getCurrentUser();
  if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "staff")) {
    adminRoot.innerHTML = "<p>Bạn cần tài khoản quản trị để mở trang này.</p>";
    return;
  }

  const isAdmin = currentUser.role === "admin";

  // Định nghĩa các tab và quyền truy cập
  const staffTabs = [
    { key: "overview", icon: "fa-chart-line", label: "Tổng quan" },
    { key: "products", icon: "fa-box", label: "Sản phẩm" },
    { key: "orders", icon: "fa-shopping-bag", label: "Đơn hàng" },
    { key: "inventory", icon: "fa-warehouse", label: "Kho hàng" },
    { key: "discounts", icon: "fa-percent", label: "Khuyến mãi" },
    { key: "reviews", icon: "fa-star", label: "Đánh giá" },
    { key: "contacts", icon: "fa-envelope", label: "Hỗ trợ" },
    { key: "statistics", icon: "fa-chart-pie", label: "BÁO CÁO THỐNG KÊ" },
    { key: "revenue", icon: "fa-dollar-sign", label: "Doanh thu" },
  ];

  const adminOnlyTabs = [
    { key: "categories", icon: "fa-tags", label: "Danh mục" },
    { key: "users", icon: "fa-user-friends", label: "Khách hàng" },
    { key: "staff", icon: "fa-user-shield", label: "Nhân viên" },
    { key: "banners", icon: "fa-image", label: "Banner" },
  ];

  const allTabs = isAdmin ? [...staffTabs, ...adminOnlyTabs] : staffTabs;

  // Cập nhật tiêu đề header
  const headerTitle = byId("adminHeaderTitle");
  if (headerTitle) {
    headerTitle.textContent = isAdmin ? "⚡ QUẢN TRỊ VIÊN" : "🛠 NHÂN VIÊN";
  }

  // Create layout
  adminRoot.innerHTML = `
    <div class="admin-shell">
      <aside class="admin-sidebar">
        <div class="admin-profile-snippet" style="text-align: center; padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1);">
          <div class="avatar-container" style="position: relative; display: inline-block;">
             <img id="adminAvatarDisplay" src="${currentUser.avatar || "images/categories/mg.jpg"}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary);">
             <button id="adminAvatarBtn" style="position: absolute; bottom: 0; right: 0; background: var(--primary); border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: black; font-size: 12px;">📷</button>
             <input type="file" id="adminAvatarInput" accept="image/*" style="display: none;">
          </div>
          <h4 style="margin: 10px 0 0; color: white;">${currentUser.name}</h4>
          <p style="font-size: 0.8em; color: var(--primary); margin: 5px 0 0;">${isAdmin ? "Quản trị viên" : "Nhân viên"}</p>
        </div>
        <h3>⚡ QUẢN TRỊ</h3>
        <nav id="adminNav">
          ${allTabs.map(t => `
            <button data-tab="${t.key}">
              <i class="fas ${t.icon}"></i> ${t.label}
            </button>
          `).join("")}
        </nav>
      </aside>
      <main class="admin-dashboard" id="adminContent">
        <!-- Content will be injected here -->
      </main>
    </div>
  `;

  const content = byId("adminContent");
  const nav = byId("adminNav");

  // Avatar Upload logic for Admin
  const adminAvatarBtn = byId("adminAvatarBtn");
  const adminAvatarInput = byId("adminAvatarInput");
  const adminAvatarDisplay = byId("adminAvatarDisplay");

  adminAvatarBtn?.addEventListener("click", () => adminAvatarInput.click());
  adminAvatarInput?.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("userId", currentUser.id);

    try {
      const res = await fetch("/api/users/upload-avatar", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (res.ok) {
        adminAvatarDisplay.src = result.url;
        const users = getUsers();
        const uIdx = users.findIndex((u) => u.id === currentUser.id);
        if (uIdx !== -1) {
          users[uIdx].avatar = result.url;
          setUsers(users);
          localStorage.setItem("gunpla_session", JSON.stringify(users[uIdx]));
        }
        showToast("Cập nhật ảnh đại diện thành công!");
      } else {
        showToast(result.error || "Lỗi khi upload");
      }
    } catch (err) {
      console.error(err);
      showToast("Lỗi kết nối backend");
    }
  });

  async function switchTab(tab) {
    // Update active button
    nav.querySelectorAll("button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tab);
    });

    // Render content
    await renderAdminTab(tab, content);
  }

  nav.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (btn) switchTab(btn.dataset.tab);
  });

  // Sidebar nav — kích hoạt tab đầu tiên
  document.querySelector("#adminNav button")?.classList.add("active");
  switchTab(allTabs[0].key);
}

async function renderAdminTab(tab, container) {
  const products = getProducts();
  const orders = getOrders();
  let users = getUsers();
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  // Fetch users from backend if needed
  if (tab === "users" || tab === "staff" || tab === "overview") {
    try {
      const backendUsers = await api.getAllUsers();
      if (Array.isArray(backendUsers)) {
        users = backendUsers;
      }
    } catch (err) {
      console.error("Failed to fetch users from backend", err);
    }
  }

  // Chặn staff truy cập tab chỉ dành cho admin
  const adminOnlyTabs = ["categories", "users", "staff", "banners"];
  if (!isAdmin && adminOnlyTabs.includes(tab)) {
    container.innerHTML = `
      <h1>Không có quyền truy cập</h1>
      <div class="dashboard-card">
        <p>Bạn không có quyền truy cập mục này. Vui lòng liên hệ quản trị viên để được cấp quyền.</p>
      </div>
    `;
    return;
  }

  if (tab === "overview") {
    container.innerHTML = `
      <h1>Tổng Quan Hệ Thống</h1>
      <button id="resetProductsBtn" class="btn-secondary" style="margin-bottom: 20px;">
        <i class="fas fa-sync"></i> Reset dữ liệu sản phẩm
      </button>
      <div class="dashboard-top">
        <div class="dashboard-card">
          <h4>Doanh thu</h4>
          <div class="value">${formatVnd(orders.reduce((sum, o) => sum + (o.total || 0), 0))}</div>
        </div>
        <div class="dashboard-card">
          <h4>Đơn hàng</h4>
          <div class="value">${orders.length}</div>
        </div>
        <div class="dashboard-card">
          <h4>Sản phẩm</h4>
          <div class="value">${products.length}</div>
        </div>
        <div class="dashboard-card">
          <h4>Người dùng</h4>
          <div class="value">${users.length}</div>
        </div>
      </div>
      <div class="dashboard-card" style="margin-top:24px;">
        <h3>Biểu đồ doanh thu</h3>
        <canvas class="chart-canvas" id="revenueChart"></canvas>
      </div>
    `;

    byId("resetProductsBtn")?.addEventListener("click", () => {
      if (confirm("Reset toàn bộ sản phẩm về mặc định?")) {
        resetProducts();
        renderAdminTab("overview", container);
        showToast("Đã reset dữ liệu.");
      }
    });

    drawNewRevenueChart("revenueChart", orders);
  } else if (tab === "products") {
    container.innerHTML = `
      <h1>Quản Lý Sản Phẩm</h1>
      <div class="dashboard-card">
        <form id="adminProductForm" class="admin-form">
          <input type="hidden" id="adminProductId">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <input type="text" id="adminName" placeholder="Tên sản phẩm" required>
            <input type="text" id="adminCategory" placeholder="Loại (MG/HG/RG/PG...)" required>
            <input type="number" id="adminPrice" placeholder="Giá mới" required>
            <input type="number" id="adminOldPrice" placeholder="Giá cũ" required>
          </div>
          <div class="admin-image-group" style="display:flex; gap:8px; align-items:center; margin-top: 15px;">
            <select id="adminImage" class="admin-image-select" style="flex:1; padding: 10px; border-radius: 8px;">
              <option value="">-- Chọn ảnh --</option>
            </select>
            <input type="file" id="adminImageUpload" accept="image/*" style="display:none;">
            <button type="button" onclick="document.getElementById('adminImageUpload').click()" class="btn-secondary">
              <i class="fas fa-upload"></i>
            </button>
          </div>
          <input type="text" id="adminBadge" placeholder="Badge (New/Hot/Sale)" style="margin-top:15px; width: 100%;">
          <textarea id="adminDesc" placeholder="Mô tả sản phẩm" style="margin-top:15px; width: 100%; min-height: 80px;"></textarea>
          <button class="btn-primary" type="submit" style="margin-top:20px; width: 100%;">Lưu sản phẩm</button>
        </form>
      </div>
      <div class="table-wrap" style="margin-top:24px;">
        <table class="admin-table-ui">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Loại</th>
              <th>Giá</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody id="adminProductTable">
            ${products
              .map(
                (p) => `
              <tr>
                <td><strong>${p.name}</strong></td>
                <td>${p.category}</td>
                <td>${formatVnd(p.price)}</td>
                <td>
                  <button data-action="edit" data-id="${p.id}" class="btn-ghost" style="padding: 5px 10px;">Sửa</button>
                  <button data-action="delete" data-id="${p.id}" class="btn-danger" style="padding: 5px 10px; background: var(--danger); color: white;">Xóa</button>
                </td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;

    // Re-bind events for products
    loadAvailableImages();
    const form = byId("adminProductForm");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      // Implementation of save product logic here (similar to existing)
      const id = byId("adminProductId").value;
      const productData = {
        id: id || "p" + Date.now(),
        name: byId("adminName").value,
        category: byId("adminCategory").value,
        price: Number(byId("adminPrice").value),
        oldPrice: Number(byId("adminOldPrice").value),
        image: byId("adminImage").value,
        description: byId("adminDesc").value,
        badge: byId("adminBadge").value,
      };

      const list = getProducts();
      if (id) {
        const idx = list.findIndex((x) => x.id === id);
        if (idx !== -1) list[idx] = productData;
      } else {
        list.unshift(productData);
      }
      setProducts(list);
      showToast("Đã lưu sản phẩm.");
      renderAdminTab("products", container);
    });

    byId("adminProductTable")?.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      const action = e.target.dataset.action;
      if (!id) return;
      if (action === "delete") {
        if (confirm("Xóa sản phẩm này?")) {
          setProducts(getProducts().filter((p) => p.id !== id));
          renderAdminTab("products", container);
        }
      } else if (action === "edit") {
        const p = getProducts().find((x) => x.id === id);
        if (p) {
          byId("adminProductId").value = p.id;
          byId("adminName").value = p.name || "";
          byId("adminCategory").value = p.category || "";
          byId("adminPrice").value = p.price || 0;
          byId("adminOldPrice").value = p.oldPrice || 0;
          byId("adminImage").value = p.image || "";
          byId("adminDesc").value = p.description || "";
          byId("adminBadge").value = p.badge || "";
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    });

    byId("adminImageUpload")?.addEventListener("change", async (e) => {
      await uploadProductImage();
    });
  } else if (tab === "orders") {
    container.innerHTML = `
      <h1>Quản Lý Đơn Hàng</h1>
      <div class="table-wrap">
        <table class="admin-table-ui">
          <thead>
            <tr>
              <th>Mã ĐH</th>
              <th>Tổng tiền</th>
              <th>Trạng thái ĐH</th>
              <th>Thanh toán</th>
            </tr>
          </thead>
          <tbody>
            ${orders
              .map(
                (o) => `
              <tr data-order-id="${o.id}">
                <td><strong>${o.id.slice(0, 8)}</strong></td>
                <td>${formatVnd(o.total)}</td>
                <td>
                  <select data-order="status" class="admin-select">
                    <option value="NEW" ${o.orderStatus === "NEW" ? "selected" : ""}>Mới</option>
                    <option value="CONFIRMED" ${o.orderStatus === "CONFIRMED" ? "selected" : ""}>Đã xác nhận</option>
                    <option value="SHIPPING" ${o.orderStatus === "SHIPPING" ? "selected" : ""}>Đang giao</option>
                    <option value="DONE" ${o.orderStatus === "DONE" ? "selected" : ""}>Hoàn tất</option>
                  </select>
                </td>
                <td>
                  <select data-order="payment" class="admin-select">
                    <option value="UNPAID" ${o.paymentStatus === "UNPAID" ? "selected" : ""}>Chưa trả</option>
                    <option value="PAID" ${o.paymentStatus === "PAID" ? "selected" : ""}>Đã trả</option>
                  </select>
                </td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;

    container.querySelectorAll("select").forEach((sel) => {
      sel.addEventListener("change", (e) => {
        const orderId = e.target.closest("tr").dataset.orderId;
        const type = e.target.dataset.order;
        const list = getOrders();
        const o = list.find((x) => x.id === orderId);
        if (o) {
          if (type === "status") o.orderStatus = e.target.value;
          else o.paymentStatus = e.target.value;
          setOrders(list);
          showToast("Đã cập nhật đơn hàng.");
        }
      });
    });
  } else if (tab === "users") {
    const regularUsers = users.filter(u => u.role !== "staff" && u.role !== "admin");
    container.innerHTML = `
      <h1>Quản Lý Khách Hàng</h1>
      <div class="dashboard-card">
        <form id="adminUserForm" class="admin-form" style="display:grid; grid-template-columns: 1fr 1fr 1fr auto; gap:12px; align-items:end;">
          <input type="hidden" id="adminUserId">
          <div>
            <label style="font-size:0.8em;color:var(--primary);">Tên</label>
            <input type="text" id="adminUserName" placeholder="Tên khách hàng" required style="width:100%;">
          </div>
          <div>
            <label style="font-size:0.8em;color:var(--primary);">Email</label>
            <input type="email" id="adminUserEmail" placeholder="user@example.com" required style="width:100%;">
          </div>
          <div>
            <label style="font-size:0.8em;color:var(--primary);">Mật khẩu</label>
            <input type="password" id="adminUserPass" placeholder="Mặc định: 123456" style="width:100%;">
          </div>
          <button class="btn-primary" type="submit" style="white-space:nowrap;">Lưu khách hàng</button>
        </form>
      </div>
      <div class="table-wrap" style="margin-top:24px;">
        <table class="admin-table-ui">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Số ĐT</th>
              <th>Ngày đăng ký</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody id="adminUserTable">
            ${regularUsers.map(u => `
              <tr>
                <td><strong>${u.name || u.username || "---"}</strong></td>
                <td>${u.email || "N/A"}</td>
                <td><span class="badge" style="background:var(--accent);padding:3px 10px;border-radius:20px;">User</span></td>
                <td>${u.phoneNumber || "---"}</td>
                <td>${u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "---"}</td>
                <td>${u.isLocked ? '<span class="badge" style="background:var(--danger);padding:3px 10px;border-radius:20px;">Bị khóa</span>' : '<span class="badge badge-success" style="padding:3px 10px;border-radius:20px;">Hoạt động</span>'}</td>
                <td>
                  <button data-action="edit" data-id="${u.id || u._id}" class="btn-ghost" style="padding:5px 10px;">Sửa</button>
                  <button data-action="${u.isLocked ? "unlock" : "lock"}" data-id="${u.id || u._id}" class="btn-ghost" style="padding:5px 10px;">${u.isLocked ? "Mở khóa" : "Khóa"}</button>
                  <button data-action="resetpass" data-id="${u.id || u._id}" class="btn-ghost" style="padding:5px 10px;">Reset MK</button>
                  <button data-action="delete" data-id="${u.id || u._id}" class="btn-danger" style="padding:5px 10px;background:var(--danger);color:white;">Xóa</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
    const userForm = byId("adminUserForm");
    userForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const editId = byId("adminUserId").value;
      const name = byId("adminUserName").value.trim();
      const email = byId("adminUserEmail").value.trim().toLowerCase();
      const password = byId("adminUserPass").value;

      if (editId) {
        // Update user logic (if backend supports it, otherwise we might need a new endpoint)
        // For now, let's assume we only support creating/deleting/locking via backend
        showToast("Tính năng sửa thông tin khách hàng đang được cập nhật");
      } else {
        try {
          const result = await api.register(name, email, password || "123456");
          if (result.success || result.token) {
            showToast("Đã thêm khách hàng");
            renderAdminTab("users", container);
          } else {
            showToast(result.message || "Lỗi khi thêm khách hàng");
          }
        } catch (err) {
          showToast("Lỗi kết nối backend");
        }
      }
    });
    byId("adminUserTable")?.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const action = e.target.dataset.action;
      if (!id) return;

      try {
        if (action === "delete") {
          if (confirm("Xóa khách hàng này?")) {
            await api.deleteUser(id);
            showToast("Đã xóa khách hàng");
            renderAdminTab("users", container);
          }
        } else if (action === "lock") {
          await api.lockUser(id);
          showToast("Đã khóa tài khoản");
          renderAdminTab("users", container);
        } else if (action === "unlock") {
          await api.unlockUser(id);
          showToast("Đã mở khóa tài khoản");
          renderAdminTab("users", container);
        } else if (action === "resetpass") {
          showToast("Tính năng reset mật khẩu đang được cập nhật");
        } else if (action === "edit") {
          const u = users.find((x) => (x.id || x._id) === id);
          if (u) {
            byId("adminUserId").value = u.id || u._id;
            byId("adminUserName").value = u.name || u.username || "";
            byId("adminUserEmail").value = u.email || "";
            byId("adminUserPass").value = "";
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }
      } catch (err) {
        showToast("Lỗi khi thực hiện thao tác");
      }
    });
  } else if (tab === "statistics") {
    renderStatisticsTab(container, products, orders);
  } else if (tab === "revenue") {
    container.innerHTML = `
      <h1>Chi Tiết Doanh Thu</h1>
      <div class="dashboard-card" style="height: 400px;">
        <canvas class="chart-canvas" id="revenueChartLarge"></canvas>
      </div>
      <div class="table-wrap" style="margin-top: 24px;">
        <table class="admin-table-ui">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Số đơn</th>
              <th>Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Hôm nay</td>
              <td>${orders.length}</td>
              <td>${formatVnd(orders.reduce((s, o) => s + (o.total || 0), 0))}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
    drawNewRevenueChart("revenueChartLarge", orders);
  } else if (tab === "staff") {
    const staffUsers = users.filter(u => u.role === "staff" || u.role === "admin");
    container.innerHTML = `
      <h1>Quản Lý Nhân Viên</h1>
      <div class="dashboard-card">
        <form id="adminStaffForm" class="admin-form" style="display:grid; grid-template-columns: 1fr 1fr 1fr auto; gap:12px; align-items:end;">
          <input type="hidden" id="adminStaffId">
          <div>
            <label style="font-size:0.8em;color:var(--primary);">Tên nhân viên</label>
            <input type="text" id="adminStaffName" placeholder="Nhập tên" required style="width:100%;">
          </div>
          <div>
            <label style="font-size:0.8em;color:var(--primary);">Email</label>
            <input type="email" id="adminStaffEmail" placeholder="staff@example.com" required style="width:100%;">
          </div>
          <div>
            <label style="font-size:0.8em;color:var(--primary);">Mật khẩu</label>
            <input type="password" id="adminStaffPass" placeholder="Để trống nếu không đổi" style="width:100%;">
          </div>
          <div>
            <label style="font-size:0.8em;color:var(--primary);">Vai trò</label>
            <select id="adminStaffRole" style="width:100%;padding:10px;border-radius:8px;background:var(--card-bg);color:var(--text);border:1px solid rgba(255,255,255,0.1);">
              <option value="staff">Nhân viên</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label style="font-size:0.8em;color:var(--primary);">Số điện thoại</label>
            <input type="text" id="adminStaffPhone" placeholder="Số ĐT" style="width:100%;">
          </div>
          <button class="btn-primary" type="submit" style="white-space:nowrap;grid-column:1/-1;">Lưu nhân viên</button>
        </form>
      </div>
      <div class="table-wrap" style="margin-top:24px;">
        <table class="admin-table-ui">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Số ĐT</th>
              <th>Ngày đăng ký</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody id="adminStaffTable">
            ${staffUsers.map(u => `
              <tr>
                <td><strong>${u.name || u.username || ""}</strong></td>
                <td>${u.email || "N/A"}</td>
                <td><span class="badge ${u.role === "admin" ? "badge-success" : "badge-warning"}" style="padding:3px 10px;border-radius:20px;">${u.role === "admin" ? "Admin" : "Staff"}</span></td>
                <td>${u.phoneNumber || "---"}</td>
                <td>${u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "---"}</td>
                <td>${u.isLocked ? '<span class="badge" style="background:var(--danger);padding:3px 10px;border-radius:20px;">Bị khóa</span>' : '<span class="badge badge-success" style="padding:3px 10px;border-radius:20px;">Hoạt động</span>'}</td>
                <td>
                  <button data-action="edit" data-id="${u.id || u._id}" class="btn-ghost" style="padding:5px 10px;">Sửa</button>
                  ${u.role !== "admin" ? `
                    <button data-action="${u.isLocked ? "unlock" : "lock"}" data-id="${u.id || u._id}" class="btn-ghost" style="padding:5px 10px;">${u.isLocked ? "Mở khóa" : "Khóa"}</button>
                    <button data-action="delete" data-id="${u.id || u._id}" class="btn-danger" style="padding:5px 10px;background:var(--danger);color:white;">Xóa</button>
                  ` : ""}
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
    const staffForm = byId("adminStaffForm");
    staffForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const editId = byId("adminStaffId").value;
      const name = byId("adminStaffName").value.trim();
      const email = byId("adminStaffEmail").value.trim().toLowerCase();
      const password = byId("adminStaffPass").value;
      const role = byId("adminStaffRole").value;
      const phone = byId("adminStaffPhone").value.trim();

      try {
        if (editId) {
          await api.updateStaff(editId, { name, password, role, phoneNumber: phone });
          showToast("Đã cập nhật nhân viên");
        } else {
          const result = await api.createStaff({ name, email, password: password || "staff123", role, phoneNumber: phone });
          if (result.success || result._id) {
            showToast("Đã thêm nhân viên");
          } else {
            showToast(result.message || "Lỗi khi thêm nhân viên");
          }
        }
        renderAdminTab("staff", container);
      } catch (err) {
        showToast("Lỗi kết nối backend");
      }
    });
    byId("adminStaffTable")?.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const action = e.target.dataset.action;
      if (!id) return;

      try {
        if (action === "delete") {
          if (confirm("Xóa nhân viên này?")) {
            await api.deleteStaff(id);
            showToast("Đã xóa nhân viên");
            renderAdminTab("staff", container);
          }
        } else if (action === "lock") {
          await api.lockStaff(id);
          showToast("Đã khóa tài khoản");
          renderAdminTab("staff", container);
        } else if (action === "unlock") {
          await api.unlockStaff(id);
          showToast("Đã mở khóa tài khoản");
          renderAdminTab("staff", container);
        } else if (action === "edit") {
          const u = users.find((x) => (x.id || x._id) === id);
          if (u) {
            byId("adminStaffId").value = u.id || u._id;
            byId("adminStaffName").value = u.name || u.username || "";
            byId("adminStaffEmail").value = u.email || "";
            byId("adminStaffPass").value = "";
            byId("adminStaffRole").value = u.role || "staff";
            byId("adminStaffPhone").value = u.phoneNumber || "";
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }
      } catch (err) {
        showToast("Lỗi khi thực hiện thao tác");
      }
    });
  } else if (tab === "inventory") {
    container.innerHTML = `
      <h1>Quản Lý Kho Hàng</h1>
      <div class="dashboard-top">
        <div class="dashboard-card">
          <h4>Tổng số mặt hàng</h4>
          <div class="value">${products.length}</div>
        </div>
        <div class="dashboard-card">
          <h4>Sắp hết hàng</h4>
          <div class="value">${products.filter((p) => (p.stock || 0) < 5).length}</div>
        </div>
      </div>
      <div class="table-wrap" style="margin-top:24px;">
        <table class="admin-table-ui">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Tồn kho</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${products
              .map(
                (p) => `
              <tr>
                <td>${p.name}</td>
                <td><span class="badge ${p.stock > 10 ? "badge-success" : "badge-warning"}">${p.stock || 0}</span></td>
                <td>
                  <button class="btn-ghost" onclick="adjustStock('${p.id}', 'in')">Nhập</button>
                  <button class="btn-ghost" onclick="adjustStock('${p.id}', 'out')">Xuất</button>
                </td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  } else if (tab === "discounts") {
    const discounts = readJSON("gunpla_discounts", [
      { code: "GUNPLA10", type: "percent", value: 10, min: 0, active: true },
      { code: "NEON20", type: "percent", value: 20, min: 500000, active: true },
    ]);
    container.innerHTML = `
      <h1>Quản Lý Khuyến Mãi</h1>
      <div class="dashboard-card">
        <form id="adminDiscountForm" class="admin-form" style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr auto; gap:12px; align-items:end;">
          <input type="hidden" id="adminDiscountOrigCode">
          <div>
            <label style="font-size:0.8em;color:var(--primary);">Mã giảm giá</label>
            <input type="text" id="adminDiscCode" placeholder="VD: SUMMER30" required style="width:100%;text-transform:uppercase;">
          </div>
          <div>
            <label style="font-size:0.8em;color:var(--primary);">Loại</label>
            <select id="adminDiscType" style="width:100%;padding:10px;border-radius:8px;background:var(--card-bg);color:var(--text);border:1px solid rgba(255,255,255,0.1);">
              <option value="percent">Phần trăm (%)</option>
              <option value="fixed">Cố định (₫)</option>
            </select>
          </div>
          <div>
            <label style="font-size:0.8em;color:var(--primary);">Giá trị</label>
            <input type="number" id="adminDiscValue" placeholder="10" required style="width:100%;">
          </div>
          <div>
            <label style="font-size:0.8em;color:var(--primary);">Đơn tối thiểu (₫)</label>
            <input type="number" id="adminDiscMin" placeholder="0" style="width:100%;">
          </div>
          <button class="btn-primary" type="submit" style="white-space:nowrap;">Lưu mã</button>
        </form>
      </div>
      <div class="table-wrap" style="margin-top:24px;">
        <table class="admin-table-ui">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Loại</th>
              <th>Giá trị</th>
              <th>Đơn tối thiểu</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody id="adminDiscountTable">
            ${discounts.map(d => `
              <tr>
                <td><strong>${d.code}</strong></td>
                <td>${d.type === "percent" ? "%" : "₫"}</td>
                <td>${d.type === "percent" ? d.value + "%" : formatVnd(d.value)}</td>
                <td>${d.min ? formatVnd(d.min) : "0₫"}</td>
                <td><span class="badge ${d.active ? "badge-success" : "badge-warning"}" style="padding:3px 10px;border-radius:20px;">${d.active ? "Hoạt động" : "Tắt"}</span></td>
                <td>
                  <button data-action="toggle" data-code="${d.code}" class="btn-ghost" style="padding:5px 10px;">${d.active ? "Tắt" : "Bật"}</button>
                  <button data-action="edit" data-code="${d.code}" class="btn-ghost" style="padding:5px 10px;">Sửa</button>
                  <button data-action="delete" data-code="${d.code}" class="btn-danger" style="padding:5px 10px;background:var(--danger);color:white;">Xóa</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
    const discForm = byId("adminDiscountForm");
    discForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const orig = byId("adminDiscountOrigCode").value;
      const code = byId("adminDiscCode").value.trim().toUpperCase();
      const type = byId("adminDiscType").value;
      const value = Number(byId("adminDiscValue").value);
      const min = Number(byId("adminDiscMin").value) || 0;
      const discs = readJSON("gunpla_discounts", []);
      if (orig) {
        const idx = discs.findIndex(x => x.code === orig);
        if (idx !== -1) discs[idx] = { code, type, value, min, active: discs[idx].active };
      } else {
        if (discs.some(x => x.code === code)) { showToast("Mã đã tồn tại"); return; }
        discs.push({ code, type, value, min, active: true });
      }
      writeJSON("gunpla_discounts", discs);
      showToast("Đã lưu mã giảm giá");
      renderAdminTab("discounts", container);
    });
    byId("adminDiscountTable")?.addEventListener("click", (e) => {
      const code = e.target.dataset.code;
      const action = e.target.dataset.action;
      if (!code) return;
      const discs = readJSON("gunpla_discounts", []);
      if (action === "delete") {
        if (confirm(`Xóa mã ${code}?`)) {
          writeJSON("gunpla_discounts", discs.filter(x => x.code !== code));
          renderAdminTab("discounts", container);
        }
      } else if (action === "toggle") {
        const d = discs.find(x => x.code === code);
        if (d) { d.active = !d.active; writeJSON("gunpla_discounts", discs); renderAdminTab("discounts", container); }
      } else if (action === "edit") {
        const d = discs.find(x => x.code === code);
        if (d) {
          byId("adminDiscountOrigCode").value = d.code;
          byId("adminDiscCode").value = d.code;
          byId("adminDiscType").value = d.type;
          byId("adminDiscValue").value = d.value;
          byId("adminDiscMin").value = d.min;
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    });
  } else if (tab === "reviews") {
    container.innerHTML = `
      <h1>Quản Lý Đánh Giá</h1>
      <div class="table-wrap">
        <table class="admin-table-ui">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Người dùng</th>
              <th>Đánh giá</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <!-- Reviews list -->
          </tbody>
        </table>
      </div>
    `;
  } else if (tab === "contacts") {
    container.innerHTML = `
      <h1>Yêu Cầu Hỗ Trợ</h1>
      <div class="table-wrap">
        <table class="admin-table-ui">
          <thead>
            <tr>
              <th>Người gửi</th>
              <th>Chủ đề</th>
              <th>Trạng thái</th>
              <th>Ngày</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <!-- Contacts list -->
          </tbody>
        </table>
      </div>
    `;
  } else if (tab === "categories") {
    const categories = readJSON("gunpla_categories", [
      { id: "ALL", name: "Tất cả", desc: "Tất cả sản phẩm" },
      { id: "MG", name: "MG (Master Grade)", desc: "Tỉ lệ 1/100, chi tiết cao" },
      { id: "HG", name: "HG (High Grade)", desc: "Tỉ lệ 1/144, dễ lắp ráp" },
      { id: "RG", name: "RG (Real Grade)", desc: "Tỉ lệ 1/144, chi tiết như MG" },
      { id: "PG", name: "PG (Perfect Grade)", desc: "Tỉ lệ 1/60, đỉnh cao" },
      { id: "SD", name: "SD (Super Deformed)", desc: "Phiên bản chibi dễ thương" },
      { id: "TOOLS", name: "Dụng cụ", desc: "Kìm, dao, giấy nhám..." },
      { id: "PAINT", name: "Sơn & Decal", desc: "Sơn, decal, phụ kiện trang trí" },
    ]);
    container.innerHTML = `
      <h1>Quản Lý Danh Mục</h1>
      <div class="dashboard-card">
        <form id="adminCategoryForm" class="admin-form" style="display:grid; grid-template-columns: 1fr 1fr 1fr auto; gap:12px; align-items:end;">
          <input type="hidden" id="adminCategoryId">
          <div>
            <label style="font-size:0.8em;color:var(--primary);">Mã danh mục</label>
            <input type="text" id="adminCateKey" placeholder="VD: MG, HG, RG..." required style="width:100%;">
          </div>
          <div>
            <label style="font-size:0.8em;color:var(--primary);">Tên danh mục</label>
            <input type="text" id="adminCateName" placeholder="Tên hiển thị" required style="width:100%;">
          </div>
          <div>
            <label style="font-size:0.8em;color:var(--primary);">Mô tả</label>
            <input type="text" id="adminCateDesc" placeholder="Mô tả ngắn" style="width:100%;">
          </div>
          <button class="btn-primary" type="submit" style="white-space:nowrap;">Lưu danh mục</button>
        </form>
      </div>
      <div class="table-wrap" style="margin-top:24px;">
        <table class="admin-table-ui">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Tên danh mục</th>
              <th>Mô tả</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody id="adminCategoryTable">
            ${categories.map(c => `
              <tr>
                <td><strong>${c.id}</strong></td>
                <td>${c.name}</td>
                <td>${c.desc || ""}</td>
                <td>
                  <button data-action="edit" data-id="${c.id}" class="btn-ghost" style="padding:5px 10px;">Sửa</button>
                  <button data-action="delete" data-id="${c.id}" class="btn-danger" style="padding:5px 10px;background:var(--danger);color:white;">Xóa</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
    const cateForm = byId("adminCategoryForm");
    cateForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const catId = byId("adminCategoryId").value;
      const key = byId("adminCateKey").value.trim().toUpperCase();
      const name = byId("adminCateName").value.trim();
      const desc = byId("adminCateDesc").value.trim();
      const cats = readJSON("gunpla_categories", []);
      if (catId) {
        const idx = cats.findIndex(x => x.id === catId);
        if (idx !== -1) { cats[idx] = { id: key, name, desc }; }
      } else {
        if (cats.some(x => x.id === key)) { showToast("Mã danh mục đã tồn tại"); return; }
        cats.push({ id: key, name, desc });
      }
      writeJSON("gunpla_categories", cats);
      showToast("Đã lưu danh mục");
      renderAdminTab("categories", container);
    });
    byId("adminCategoryTable")?.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      const action = e.target.dataset.action;
      if (!id) return;
      const cats = readJSON("gunpla_categories", []);
      if (action === "delete") {
        if (confirm(`Xóa danh mục ${id}?`)) {
          writeJSON("gunpla_categories", cats.filter(x => x.id !== id));
          renderAdminTab("categories", container);
        }
      } else if (action === "edit") {
        const c = cats.find(x => x.id === id);
        if (c) {
          byId("adminCategoryId").value = c.id;
          byId("adminCateKey").value = c.id;
          byId("adminCateName").value = c.name;
          byId("adminCateDesc").value = c.desc || "";
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    });
  } else if (tab === "banners") {
    container.innerHTML = `
      <h1>Quản Lý Banner</h1>
      <p>Chức năng cập nhật Slide và Banner khuyến mãi.</p>
      <div class="dashboard-card">
        <p>Tính năng đang được phát triển...</p>
      </div>
    `;
  }
}

/* ========== STATISTICS / BÁO CÁO THỐNG KÊ ========== */

function groupOrdersByPeriod(orders, period) {
  const groups = {};
  orders.forEach((o) => {
    const d = new Date(o.createdAt || o.createdAt || Date.now());
    let key;
    if (period === "day") {
      key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    } else if (period === "month") {
      key = d.toISOString().slice(0, 7); // YYYY-MM
    } else {
      key = String(d.getFullYear());
    }
    if (!groups[key]) groups[key] = { count: 0, total: 0, items: [] };
    groups[key].count += 1;
    groups[key].total += Number(o.total || o.totalPrice || 0);
    groups[key].items.push(o);
  });
  return groups;
}

function computeStatsMetrics(orders) {
  const totals = orders.map((o) => Number(o.total || o.totalPrice || 0));
  if (!totals.length) {
    return { total: 0, max: 0, min: 0, avg: 0, count: 0 };
  }
  const sum = totals.reduce((s, v) => s + v, 0);
  return {
    total: sum,
    max: Math.max(...totals),
    min: Math.min(...totals),
    avg: Math.round(sum / totals.length),
    count: totals.length,
  };
}

function drawStatsBarChart(canvasId, groups, periodLabel) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  const W = rect.width;
  const H = rect.height;
  const PAD = { t: 35, r: 20, b: 60, l: 70 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  const entries = Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  if (!entries.length) {
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Chưa có dữ liệu", W / 2, H / 2);
    return;
  }

  const maxVal = Math.max(...entries.map(([, v]) => v.total), 1);
  const barCount = entries.length;
  const barW = Math.min(Math.max((chartW / barCount) * 0.55, 12), 52);
  const gap = (chartW - barW * barCount) / (barCount + 1);
  ctx.clearRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  for (let i = 0; i <= 4; i++) {
    const y = PAD.t + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(PAD.l, y);
    ctx.lineTo(W - PAD.r, y);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(formatVnd(Math.round(maxVal * (1 - i / 4))), PAD.l - 8, y);
  }
  ctx.setLineDash([]);

  entries.forEach(([key, val], i) => {
    const barH = val.total > 0 ? Math.max((val.total / maxVal) * chartH, 3) : 0;
    const x = PAD.l + gap + i * (barW + gap);
    const y = PAD.t + chartH - barH;

    ctx.shadowColor = "rgba(0,229,255,0.35)";
    ctx.shadowBlur = 10;

    const grd = ctx.createLinearGradient(0, y, 0, y + barH);
    grd.addColorStop(0, "#00e5ff");
    grd.addColorStop(0.5, "#7c3aed");
    grd.addColorStop(1, "#ff355d");
    ctx.fillStyle = grd;

    const r = 4;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + barW - r, y);
    ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
    ctx.lineTo(x + barW, y + barH);
    ctx.lineTo(x + r, y + barH);
    ctx.quadraticCurveTo(x, y + barH, x, y + barH - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    if (val.total > 0) {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(formatVnd(val.total), x + barW / 2, y - 5);
    }

    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "9px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const displayLabel =
      periodLabel === "day"
        ? key.slice(5)
        : periodLabel === "month"
          ? key.slice(0, 7)
          : key;
    ctx.translate(x + barW / 2, PAD.t + chartH + 8);
    ctx.rotate(-0.5);
    ctx.fillText(displayLabel, 0, 0);
    ctx.restore();
  });
}

function drawStatsLineChart(canvasId, groups) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  const W = rect.width;
  const H = rect.height;
  const PAD = { t: 30, r: 24, b: 45, l: 64 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  const entries = Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  if (!entries.length) {
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Chưa có dữ liệu", W / 2, H / 2);
    return;
  }

  const maxVal = Math.max(...entries.map(([, v]) => v.total), 1);
  ctx.clearRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  for (let i = 0; i <= 4; i++) {
    const y = PAD.t + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(PAD.l, y);
    ctx.lineTo(W - PAD.r, y);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(formatVnd(Math.round(maxVal * (1 - i / 4))), PAD.l - 8, y);
  }
  ctx.setLineDash([]);

  // Fill gradient
  const pts = entries.map(([, val], i) => {
    const x = PAD.l + (i / Math.max(entries.length - 1, 1)) * chartW;
    const y = PAD.t + chartH - (val.total / maxVal) * chartH;
    return { x, y, val: val.total };
  });

  const fillGrd = ctx.createLinearGradient(0, PAD.t, 0, PAD.t + chartH);
  fillGrd.addColorStop(0, "rgba(0,229,255,0.18)");
  fillGrd.addColorStop(1, "rgba(0,229,255,0.01)");
  ctx.beginPath();
  ctx.moveTo(pts[0].x, PAD.t + chartH);
  pts.forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.lineTo(pts[pts.length - 1].x, PAD.t + chartH);
  ctx.closePath();
  ctx.fillStyle = fillGrd;
  ctx.fill();

  // Line
  const lineGrd = ctx.createLinearGradient(W / 2, 0, W / 2, H);
  lineGrd.addColorStop(0, "#00e5ff");
  lineGrd.addColorStop(1, "#ff355d");
  ctx.strokeStyle = lineGrd;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.beginPath();
  pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.stroke();

  // Dots
  pts.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#00e5ff";
    ctx.fill();
    ctx.strokeStyle = "#050814";
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Labels
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "9px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  entries.forEach(([key], i) => {
    const x = PAD.l + (i / Math.max(entries.length - 1, 1)) * chartW;
    ctx.fillText(key, x, PAD.t + chartH + 8);
  });
}

function renderStatisticsTab(container, products, orders) {
  const allOrders = Array.isArray(orders) ? orders : [];
  const prodCount = Array.isArray(products) ? products.length : 0;

  // Tính toán các chỉ số
  const metrics = computeStatsMetrics(allOrders);
  const totalInventoryValue = Array.isArray(products)
    ? products.reduce((sum, p) => sum + Number(p.price || 0) * Number(p.stock || 0), 0)
    : 0;

  container.innerHTML = `
    <h1 style="margin-bottom: 8px;">📊 BÁO CÁO THỐNG KÊ</h1>
    <p style="color: var(--muted); margin-bottom: 28px; font-size: 0.9rem;">
      Phân tích chi tiết doanh thu, đơn hàng và sản phẩm
    </p>

    <!-- ===== 4 THẺ THỐNG KÊ CHÍNH ===== -->
    <div class="stats-hero">
      <div class="stat-card total">
        <div class="stat-icon"><i class="fas fa-dollar-sign"></i></div>
        <div class="stat-label">TỔNG GIÁ TRỊ</div>
        <div class="stat-value">${formatVnd(metrics.total)}</div>
        <div class="stat-sub">${metrics.count} đơn hàng</div>
      </div>
      <div class="stat-card max">
        <div class="stat-icon"><i class="fas fa-arrow-up"></i></div>
        <div class="stat-label">GIÁ TRỊ LỚN NHẤT</div>
        <div class="stat-value">${formatVnd(metrics.max)}</div>
        <div class="stat-sub">Đơn hàng cao nhất</div>
      </div>
      <div class="stat-card min">
        <div class="stat-icon"><i class="fas fa-arrow-down"></i></div>
        <div class="stat-label">GIÁ TRỊ NHỎ NHẤT</div>
        <div class="stat-value">${formatVnd(metrics.min)}</div>
        <div class="stat-sub">Đơn hàng thấp nhất</div>
      </div>
      <div class="stat-card avg">
        <div class="stat-icon"><i class="fas fa-chart-simple"></i></div>
        <div class="stat-label">TRUNG BÌNH</div>
        <div class="stat-value">${formatVnd(metrics.avg)}</div>
        <div class="stat-sub">Trung bình / đơn hàng</div>
      </div>
    </div>

    <!-- ===== BỘ LỌC ===== -->
    <div class="stats-filters">
      <label><i class="fas fa-filter"></i> Lọc:</label>
      <input type="date" id="statsDateFrom" title="Từ ngày">
      <span style="color:var(--muted);">đến</span>
      <input type="date" id="statsDateTo" title="Đến ngày">
      <input type="text" id="statsSearch" placeholder="🔍 Tìm theo mã ĐH / sản phẩm..." style="flex:1; min-width:200px;">
      <button class="btn-filter" id="statsApplyBtn"><i class="fas fa-check"></i> Áp dụng</button>
      <button class="btn-filter reset" id="statsResetBtn"><i class="fas fa-redo"></i> Đặt lại</button>
    </div>

    <!-- ===== BIỂU ĐỒ ===== -->
    <div class="stats-chart-row">
      <div class="stats-chart-panel">
        <h3><i class="fas fa-calendar-day"></i> THỐNG KÊ THEO NGÀY</h3>
        <canvas id="chartByDay"></canvas>
        <div class="period-tabs" style="margin-top:12px;">
          <span class="period-tab active" data-period="day">📅 Ngày</span>
          <span class="period-tab" data-period="month">📆 Tháng</span>
          <span class="period-tab" data-period="year">📈 Năm</span>
        </div>
      </div>
      <div class="stats-chart-panel">
        <h3><i class="fas fa-chart-line"></i> XU HƯỚNG DOANH THU</h3>
        <canvas id="chartTrend"></canvas>
      </div>
    </div>

    <!-- ===== BẢNG CHI TIẾT ===== -->
    <div class="stats-chart-panel full-width" style="margin-bottom:24px;">
      <h3 style="display:flex; justify-content:space-between; align-items:center;">
        <span><i class="fas fa-table"></i> BẢNG CHI TIẾT ĐƠN HÀNG</span>
        <span style="font-size:0.8rem; color:var(--muted);" id="statsTableInfo">${allOrders.length} đơn hàng</span>
      </h3>
      <div class="stats-table-wrap">
        <table class="stats-table" id="statsDetailTable">
          <thead>
            <tr>
              <th>Mã ĐH</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Số SP</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody id="statsTableBody"></tbody>
        </table>
      </div>
      <div id="statsPagination" style="display:flex; justify-content:center; gap:8px; margin-top:16px;"></div>
    </div>
  `;

  // ---- Logic ----
  let currentPeriod = "day";
  let filteredOrders = [...allOrders];
  let currentStatsPage = 0;
  const STATS_PAGE_SIZE = 10;

  function applyFilters() {
    const from = document.getElementById("statsDateFrom")?.value;
    const to = document.getElementById("statsDateTo")?.value;
    const search = (document.getElementById("statsSearch")?.value || "").trim().toLowerCase();

    filteredOrders = allOrders.filter((o) => {
      if (from) {
        const od = new Date(o.createdAt || o.createdAt || 0);
        if (od < new Date(from)) return false;
      }
      if (to) {
        const od = new Date(o.createdAt || o.createdAt || 0);
        // to date is inclusive: end of day
        const toEnd = new Date(to);
        toEnd.setHours(23, 59, 59, 999);
        if (od > toEnd) return false;
      }
      if (search) {
        const haystack = `${o.id || ""} ${o._id || ""} ${o.customer?.fullName || ""} ${o.customer?.name || ""} ${(o.items || []).map((it) => (it.product?.name || it.name || "")).join(" ")}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });

    currentStatsPage = 0;
    updateAllStatsCharts();
    renderStatsTable();
  }

  function updateAllStatsCharts() {
    const fm = computeStatsMetrics(filteredOrders);

    // Update hero cards
    const cards = container.querySelectorAll(".stat-card");
    if (cards.length >= 4) {
      cards[0].querySelector(".stat-value").textContent = formatVnd(fm.total);
      cards[0].querySelector(".stat-sub").textContent = `${fm.count} đơn hàng`;
      cards[1].querySelector(".stat-value").textContent = formatVnd(fm.max);
      cards[2].querySelector(".stat-value").textContent = formatVnd(fm.min);
      cards[3].querySelector(".stat-value").textContent = formatVnd(fm.avg);
    }

    const infoEl = document.getElementById("statsTableInfo");
    if (infoEl) infoEl.textContent = `${filteredOrders.length} đơn hàng`;

    // Redraw charts
    const dayGroups = groupOrdersByPeriod(filteredOrders, "day");
    drawStatsBarChart("chartByDay", dayGroups, "day");
    const monthGroups = groupOrdersByPeriod(filteredOrders, "month");
    drawStatsLineChart("chartTrend", monthGroups);
  }

  function renderStatsTable() {
    const tbody = document.getElementById("statsTableBody");
    if (!tbody) return;

    const start = currentStatsPage * STATS_PAGE_SIZE;
    const page = filteredOrders.slice(start, start + STATS_PAGE_SIZE);

    if (!page.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px; color:var(--muted);">
        <i class="fas fa-inbox" style="font-size:2rem; display:block; margin-bottom:10px;"></i>
        Không có đơn hàng nào phù hợp
      </td></tr>`;
      document.getElementById("statsPagination").innerHTML = "";
      return;
    }

    tbody.innerHTML = page
      .map((o) => {
        const orderId = (o.id || o._id || "---").toString().slice(0, 10);
        const customerName = o.customer?.fullName || o.customer?.name || o.user?.name || "Khách";
        const dateStr = o.createdAt
          ? new Date(o.createdAt).toLocaleDateString("vi-VN")
          : "---";
        const itemCount = (o.items || []).reduce((s, it) => s + Number(it.quantity || 1), 0);
        const total = Number(o.total || o.totalPrice || 0);
        const status = o.orderStatus || o.status || "NEW";
        const statusMap = {
          NEW: { cls: "pending", label: "Mới" },
          CONFIRMED: { cls: "active", label: "Đã xác nhận" },
          SHIPPING: { cls: "active", label: "Đang giao" },
          DONE: { cls: "", label: "Hoàn tất" },
          CANCELLED: { cls: "banned", label: "Đã hủy" },
        };
        const st = statusMap[status] || { cls: "", label: status };
        return `
          <tr>
            <td><strong>#${orderId}</strong></td>
            <td>${customerName}</td>
            <td>${dateStr}</td>
            <td>${itemCount}</td>
            <td class="highlight">${formatVnd(total)}</td>
            <td><span class="status ${st.cls}">${st.label}</span></td>
          </tr>
        `;
      })
      .join("");

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / STATS_PAGE_SIZE);
    const pagEl = document.getElementById("statsPagination");
    if (pagEl && totalPages > 1) {
      let pagesHTML = "";
      for (let i = 0; i < totalPages; i++) {
        pagesHTML += `<button class="period-tab ${i === currentStatsPage ? "active" : ""}" data-stats-page="${i}">${i + 1}</button>`;
      }
      pagEl.innerHTML = pagesHTML;
      pagEl.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => {
          currentStatsPage = parseInt(btn.dataset.statsPage);
          renderStatsTable();
        });
      });
    } else if (pagEl) {
      pagEl.innerHTML = "";
    }
  }

  // Bind filter events
  document.getElementById("statsApplyBtn")?.addEventListener("click", applyFilters);
  document.getElementById("statsResetBtn")?.addEventListener("click", () => {
    const fromEl = document.getElementById("statsDateFrom");
    const toEl = document.getElementById("statsDateTo");
    const searchEl = document.getElementById("statsSearch");
    if (fromEl) fromEl.value = "";
    if (toEl) toEl.value = "";
    if (searchEl) searchEl.value = "";
    filteredOrders = [...allOrders];
    currentStatsPage = 0;
    updateAllStatsCharts();
    renderStatsTable();
  });

  // Period switch
  container.querySelectorAll(".period-tab[data-period]").forEach((tab) => {
    tab.addEventListener("click", () => {
      container.querySelectorAll(".period-tab[data-period]").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentPeriod = tab.dataset.period;
      const canvasId = "chartByDay";
      const groups = groupOrdersByPeriod(filteredOrders, currentPeriod);
      drawStatsBarChart(canvasId, groups, currentPeriod);
    });
  });

  // Initial render
  updateAllStatsCharts();
  renderStatsTable();

  // Handle canvas resize
  const roDay = new ResizeObserver(() => {
    const groups = groupOrdersByPeriod(filteredOrders, currentPeriod);
    drawStatsBarChart("chartByDay", groups, currentPeriod);
  });
  const chartDay = document.getElementById("chartByDay");
  if (chartDay?.parentElement) roDay.observe(chartDay.parentElement);

  const roTrend = new ResizeObserver(() => {
    const groups = groupOrdersByPeriod(filteredOrders, "month");
    drawStatsLineChart("chartTrend", groups);
  });
  const chartTrend = document.getElementById("chartTrend");
  if (chartTrend?.parentElement) roTrend.observe(chartTrend.parentElement);
}

function renderFooterYear() {
  const yearEl = byId("footerYear");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

function logout() {
  setCurrentUser(null);
  localStorage.removeItem("gunpla_session");
  showToast("Đã đăng xuất");
  setTimeout(() => (window.location.href = "index.html"), 700);
}

// Global functions for inline onclick
window.logout = logout;
window.adjustStock = async (productId, type) => {
  const quantity = prompt(
    `Nhập số lượng muốn ${type === "in" ? "nhập" : "xuất"}:`,
    "1",
  );
  if (!quantity || isNaN(quantity)) return;
  const reason = prompt(
    "Lý do:",
    type === "in" ? "Nhập hàng mới" : "Xuất kho bán hàng",
  );

  try {
    const res = await api.adjustStock(
      productId,
      type,
      Number(quantity),
      reason,
    );
    if (res._id) {
      showToast("Cập nhật kho thành công");
      // Refresh UI if necessary
      location.reload();
    } else {
      showToast(res.message || "Lỗi cập nhật");
    }
  } catch (err) {
    showToast("Lỗi kết nối");
  }
};

function initNavToggle() {
  const navToggle = byId("navToggle");
  const mainNav = byId("mainNav");

  if (!navToggle || !mainNav) return;

  navToggle.addEventListener("click", () => {
    mainNav.classList.toggle("nav-active");
  });

  // Close menu when clicking on a nav link
  const navLinks = mainNav.querySelectorAll(".nav-links a");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.add("nav-hidden");
      mainNav.classList.remove("nav-active");
    });
  });
}

function initThemeIcon() {
  const toggleBtn = byId("themeToggle");
  if (!toggleBtn) return;

  const icon = toggleBtn.querySelector("i");
  if (icon) {
    if (document.body.classList.contains("light-mode")) {
      icon.className = "fas fa-sun";
    } else {
      icon.className = "fas fa-moon";
    }
  }
}

function restoreTheme() {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "light") document.body.classList.add("light-mode");
    else document.body.classList.remove("light-mode");
  } catch (e) {
    // ignore
  }
}

async function bootstrap() {
  applyDevReset();
  seedData();
  removeSampleStaffAccounts();
  restoreTheme();
  initCursorEffect();
  initThemeIcon();
  initMenuInteractions();
  initHeroSlider();
  initParallax();
  initAuthForms();
  renderHeaderUserState();
  renderFooterYear();
  hideLoader();
  initQuickModal();
  initRevealObserver();
  initNavToggle();

  allProducts = await loadProductsData();
  initProductsPage();
  renderProductsGrid();
  renderCartPage();
  renderProductDetailPage();
  renderCheckoutPage();
  renderUserPage();
  initAdminPage();
}

window.addEventListener("load", bootstrap);

