/* ==========================
   VISITOR COUNTER
========================== */
document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("ln_visited")) {
    let visits = Number(localStorage.getItem("ln_visits") || 0) + 1;
    localStorage.setItem("ln_visits", visits);
    localStorage.setItem("ln_visited", "true");
  }
  const v = document.getElementById("visits");
  if (v) v.innerText = localStorage.getItem("ln_visits");
});

/* ==========================
   UV EASTER EGG
========================== */
document.addEventListener("DOMContentLoaded", () => {
  const logo = document.querySelector(".logo");
  if (logo) {
    logo.addEventListener("click", () => {
      document.body.classList.toggle("uv");
    });
  }
});

/* ==========================
   MODAL LOGIC
========================== */
let modalData = {
  imgA: "",
  imgB: "",
  name: "",
  price: 0,
  desc: "",
  uv: false
};

function openModal(a, b, name, price, desc) {
  modalData = { imgA: a, imgB: b, name, price, desc, uv: false };
  const modal = document.getElementById("modal");
  if (!modal) return;
  document.getElementById("modalImg").src = a;
  document.getElementById("modalDesc").innerText = desc;
  modal.style.display = "flex";
}

function closeModal() {
  const modal = document.getElementById("modal");
  if (!modal) return;
  modal.style.display = "none";
}

function toggleUV() {
  modalData.uv = !modalData.uv;
  document.getElementById("modalImg").src =
    modalData.uv ? modalData.imgB : modalData.imgA;
}

/* ==========================
   CART CORE
========================== */
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCartFromModal() {
  const variant = document.getElementById("modalVariant").value;
  let cart = getCart();

  const existing = cart.find(
    i => i.name === modalData.name && i.variant === variant
  );

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      name: modalData.name,
      price: modalData.price,
      variant,
      qty: 1
    });
  }

  saveCart(cart);
  closeModal();
  renderCart && renderCart();
}

/* ==========================
   CART TABLE RENDER
========================== */
function renderCart() {
  const tbody = document.querySelector("#cartTable tbody");
  const totalEl = document.getElementById("cartTotal");
  if (!tbody || !totalEl) return;

  let cart = getCart();
  tbody.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.name}</td>
      <td>
        <select onchange="updateVariant(${index}, this.value)">
          <option ${item.variant === "Classic" ? "selected" : ""}>Classic</option>
          <option ${item.variant === "Limited" ? "selected" : ""}>Limited</option>
          <option ${item.variant === "Lacto-free" ? "selected" : ""}>Lacto-free</option>
          <option ${item.variant === "Bezlepkove" ? "selected" : ""}>Bezlepkove</option>
        </select>
      </td>
      <td>
        <input type="number" min="1" value="${item.qty}"
          onchange="updateQty(${index}, this.value)">
      </td>
      <td>${item.price * item.qty} €</td>
      <td><a onclick="removeItem(${index})">?</a></td>
    `;

    tbody.appendChild(row);
    total += item.price * item.qty;
  });

  totalEl.innerText = total + " €";
}

function updateQty(i, val) {
  let cart = getCart();
  cart[i].qty = Math.max(1, Number(val));
  saveCart(cart);
  renderCart();
}

function updateVariant(i, val) {
  let cart = getCart();
  cart[i].variant = val;
  saveCart(cart);
  renderCart();
}

function removeItem(i) {
  let cart = getCart();
  cart.splice(i, 1);
  saveCart(cart);
  renderCart();
}

/* ==========================
   EMAILJS INIT
========================== */
(function(){
  if (window.emailjs) {
    emailjs.init("uBmaCJ5QxxC0LOY1W");
  }
})();

/* ==========================
   EMAILJS – CART ORDER
========================== */
const conciergeForm = document.getElementById("conciergeForm");
if (conciergeForm) {
  conciergeForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const gdprCheckbox = document.getElementById("gdprOrder");
    if (!gdprCheckbox.checked) {
      document.getElementById("conciergeMessage").innerText =
        "Musíte súhlasiť so spracovaním osobných údajov.";
      return;
    }

    let cart = getCart();
    if (!cart.length) {
      document.getElementById("conciergeMessage").innerText =
        "Košík je prázdny.";
      return;
    }

    let cartHTML = `<table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th>Produkt</th>
          <th>Variant</th>
          <th>Počet</th>
          <th>Cena (€)</th>
        </tr>
      </thead>
      <tbody>`;
    let total = 0;
    cart.forEach(item => {
      cartHTML += `<tr>
        <td>${item.name}</td>
        <td>${item.variant}</td>
        <td>${item.qty}</td>
        <td>${item.price * item.qty} €</td>
      </tr>`;
      total += item.price * item.qty;
    });
    cartHTML += `</tbody>
      <tfoot>
        <tr>
          <th colspan="3">Celková suma</th>
          <th>${total} €</th>
        </tr>
      </tfoot>
    </table>`;

    const cartInput = document.createElement("input");
    cartInput.type = "hidden";
    cartInput.name = "cartHTML";
    cartInput.value = cartHTML;

    conciergeForm.appendChild(cartInput);

    emailjs.sendForm(
      "service_skuvlfb",
      "template_17jkem8",
      conciergeForm
    ).then(() => {
      localStorage.removeItem("cart");
      document.getElementById("conciergeMessage").innerText =
        "Objednávka bola diskrétne prijatá. Concierge vás bude kontaktovať.";
      conciergeForm.reset();
      renderCart();
    }).catch(err => {
      document.getElementById("conciergeMessage").innerText =
        "Chyba pri odosielaní objednávky. Skúste znova.";
      console.error(err);
    });
  });
}

/* ==========================
   EMAILJS – CONTACT FORM
========================== */
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const gdprCheckbox = document.getElementById("gdprContact");
    if (gdprCheckbox && !gdprCheckbox.checked) {
      document.getElementById("contactMessage").innerText =
        "Musíte súhlasiť so spracovaním osobných údajov.";
      return;
    }

    emailjs.sendForm(
      "service_skuvlfb",
      "template_xiqb34i",
      contactForm
    ).then(() => {
      document.getElementById("contactMessage").innerText =
        "Správa bola prijatá. Ozveme sa diskrétne.";
      contactForm.reset();
    }).catch(err => {
      document.getElementById("contactMessage").innerText =
        "Chyba pri odosielaní správy. Skúste znova.";
      console.error(err);
    });
  });
}

/* ==========================
   INIT CART ON LOAD
========================== */
document.addEventListener("DOMContentLoaded", () => {
  renderCart && renderCart();
});

/* ==========================
   Premium Particle + Micro-animation Layer
========================== */
document.addEventListener("DOMContentLoaded", () => {
  initParticles();
});

function initParticles() {
  const hero = document.querySelector(".hero");
  const productGrid = document.querySelector(".grid");

  [hero, productGrid].forEach(container => {
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = 1;
    container.style.position = "relative";
    container.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    let particles = [];

    function resize() {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      particles = [];
      for (let i = 0; i < 60; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 2 + 1,
          dx: (Math.random() - 0.5) * 0.5,
          dy: (Math.random() - 0.5) * 0.5,
          alpha: Math.random() * 0.5 + 0.2
        });
      }
    }

    window.addEventListener("resize", resize);
    resize();

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(179,107,255,${p.alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(animate);
    }

    animate();
  });
}

/* ==========================
   Fade-in sections on scroll
========================== */
document.addEventListener("DOMContentLoaded", () => {
  const faders = document.querySelectorAll(".fade-in-section");
  const appearOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
  const appearOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, appearOptions);

  faders.forEach(fader => appearOnScroll.observe(fader));
});
