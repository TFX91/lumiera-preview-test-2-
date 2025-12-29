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
  document.getElementById("modalImg").src = a;
  document.getElementById("modalDesc").innerText = desc;
  document.getElementById("modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
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
      <td><a onclick="removeItem(${index})">✕</a></td>
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

    // GDPR check
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

    // Vytvoriť HTML tabuľku pre email
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

    // Pridať hidden inputy pre EmailJS
    const cartInput = document.createElement("input");
    cartInput.type = "hidden";
    cartInput.name = "cartHTML";
    cartInput.value = cartHTML;

    conciergeForm.appendChild(cartInput);

    // Odoslať cez EmailJS
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
   EMAILJS – CONTACT FORM (Vision)
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
