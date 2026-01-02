document.addEventListener("DOMContentLoaded", () => {

  /* ==========================
     GLOBAL STATE
  ========================== */
  window.artifactsState = {
    modalData: { imgA: "", imgB: "", name: "", price: 0, desc: "", uv: false, variant: [] },
    personality: { uvMode: localStorage.getItem("ln_uv") === "true" },
    wishlist: [],
    scrollDepth: 0,
    ephemeralContent: {},
    manifestShown: false
  };

  /* ==========================
     NAVBAR UV MODE
  ========================== */
  const logo = document.querySelector(".logo");
  if (logo) {
    if (window.artifactsState.personality.uvMode) document.body.classList.add("uv");
    logo.addEventListener("click", () => {
      document.body.classList.toggle("uv");
      window.artifactsState.personality.uvMode = document.body.classList.contains("uv");
      localStorage.setItem("ln_uv", window.artifactsState.personality.uvMode);
      silentFeedback();
    });
    let pulse = true;
    setInterval(() => {
      logo.style.transform = pulse ? "scale(1.05)" : "scale(1)";
      logo.style.textShadow = pulse ? "0 0 12px var(--uv)" : "0 0 0 var(--uv)";
      pulse = !pulse;
    }, 1500);
  }

  /* ==========================
     COLLECTION PRODUCTS
  ========================== */
  window.collection = [];
  const gridContainer = document.querySelector(".grid");
  for (let i = 1; i <= 20; i++) {
    window.collection.push({
      id: `p${i}`,
      name: `Artefakt #${i}`,
      price: Math.floor(Math.random() * 200) + 50,
      desc: `Luxusný artefakt č.${i}`,
      variant: ["Classic", "Limited", "Lacto-free", "Bezlepkove"],
      imgA: `https://picsum.photos/seed/art${i}/400/400`,
      imgB: `https://picsum.photos/seed/art${i}b/400/400`,
      featured: false
    });
  }

  function renderCollection() {
    if (!gridContainer) return;
    gridContainer.innerHTML = "";
    window.collection.forEach(product => {
      const div = document.createElement("div");
      div.className = "product";
      div.innerHTML = `
        <img src='${product.imgA}' alt='${product.name}'>
        <h4>${product.name}</h4>
        <p>${product.price} €</p>
      `;
      div.addEventListener("click", () => openModal(product));
      gridContainer.appendChild(div);
    });
  }
  renderCollection();

  /* ==========================
     MODAL LOGIC
  ========================== */
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");
  const modalName = document.getElementById("modalName");
  const modalDesc = document.getElementById("modalDesc");
  const modalVariant = document.getElementById("modalVariant");
  const modalUVBtn = document.getElementById("modalUVBtn");
  const modalWishlistBtn = document.getElementById("modalWishlistBtn");

  window.openModal = function (product) {
    window.artifactsState.modalData = { ...product, uv: false };
    if (!modal) return;
    modal.style.display = "flex";
    modalImg.src = product.imgA;
    modalName.innerText = product.name;
    modalDesc.innerText = product.desc;
    modalVariant.innerHTML = product.variant.map(v => `<option>${v}</option>`).join("");
    modalVariant.value = product.variant[0];
    silentFeedback();
  }

  window.closeModal = function () {
    if (modal) modal.style.display = "none";
  }

  window.toggleUV = function () {
    const data = window.artifactsState.modalData;
    data.uv = !data.uv;
    modalImg.src = data.uv ? data.imgB : data.imgA;
    silentFeedback();
  }

  if (modalUVBtn) modalUVBtn.addEventListener("click", () => toggleUV());
  if (modalWishlistBtn) modalWishlistBtn.addEventListener("click", () => addToWishlist(window.artifactsState.modalData));

  function addToWishlist(product) {
    if (!product) return;
    const exists = window.artifactsState.wishlist.find(p => p.name === product.name);
    if (!exists) window.artifactsState.wishlist.push(product);
    renderWishlist();
    silentFeedback();
  }

  function renderWishlist() {
    const container = document.getElementById("wishlistGrid");
    if (!container) return;
    container.innerHTML = "";
    window.artifactsState.wishlist.forEach(product => {
      const div = document.createElement("div");
      div.className = "product";
      div.innerHTML = `
        <img src="${product.imgA}" alt="${product.name}">
        <h4>${product.name}</h4>
        <p>${product.price} €</p>
      `;
      container.appendChild(div);
    });
  }

  /* ==========================
     CART
  ========================== */
  window.getCart = () => JSON.parse(localStorage.getItem("cart") || "[]");
  window.saveCart = cart => localStorage.setItem("cart", JSON.stringify(cart));

  window.addToCartFromModal = function () {
    const variant = modalVariant?.value || "Classic";
    let cart = getCart();
    const existing = cart.find(i => i.name === window.artifactsState.modalData.name && i.variant === variant);
    if (existing) existing.qty += 1;
    else cart.push({ name: window.artifactsState.modalData.name, price: window.artifactsState.modalData.price, variant, qty: 1 });
    saveCart(cart);
    closeModal();
  }

  /* ==========================
     SILENT FEEDBACK
  ========================== */
  function silentFeedback() {
    const fb = document.createElement("div");
    fb.className = "silent-feedback";
    fb.style.position = "fixed";
    fb.style.width = "10px";
    fb.style.height = "10px";
    fb.style.borderRadius = "50%";
    fb.style.background = "var(--uv)";
    fb.style.top = Math.random() * window.innerHeight + "px";
    fb.style.left = Math.random() * window.innerWidth + "px";
    fb.style.opacity = "0.2";
    fb.style.pointerEvents = "none";
    document.body.appendChild(fb);
    setTimeout(() => document.body.removeChild(fb), 300);
  }

  /* ==========================
     PARTICLES BACKGROUND
  ========================== */
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = 0; canvas.style.left = 0; canvas.style.zIndex = -3; canvas.style.pointerEvents = "none";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;
  const particles = [];
  for (let i = 0; i < 60; i++) particles.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 2 + 0.5, dx: (Math.random() - 0.5) * 0.3, dy: (Math.random() - 0.5) * 0.3, alpha: Math.random() * 0.4 + 0.2 });

  function drawParticles() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.dx; p.y += p.dy;
      if (p.x > w) p.x = 0; if (p.x < 0) p.x = w;
      if (p.y > h) p.y = 0; if (p.y < 0) p.y = h;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(179,107,255,${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(drawParticles);
  }
  drawParticles();
  window.addEventListener("resize", () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; });

});
