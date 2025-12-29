document.addEventListener("DOMContentLoaded", () => {
  /* ==========================
     VISITOR COUNTER
  ========================= */
  if (!localStorage.getItem("ln_visited")) {
    let visits = Number(localStorage.getItem("ln_visits") || 0) + 1;
    localStorage.setItem("ln_visits", visits);
    localStorage.setItem("ln_visited", "true");
  }
  const v = document.getElementById("visits");
  if (v) v.innerText = localStorage.getItem("ln_visits");

  /* ==========================
     UV EASTER EGG
  ========================= */
  const logo = document.querySelector(".logo");
  if (logo) {
    logo.addEventListener("click", () => document.body.classList.toggle("uv"));
  }

  /* ==========================
     INIT CART
  ========================= */
  renderCart && renderCart();

  /* ==========================
     Scroll Fade-in
  ========================== */
  const faders = document.querySelectorAll(".fade-in-section");
  const appearOptions = { threshold: 0.2, rootMargin: "0px 0px -50px 0px" };
  const appearOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, appearOptions);

  faders.forEach(fader => appearOnScroll.observe(fader));

  /* ==========================
     PREMIUM PARTICLE LAYER
  ========================== */
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;
  const particles = [];

  for(let i=0;i<50;i++){
    particles.push({
      x: Math.random()*w,
      y: Math.random()*h,
      r: Math.random()*2+1,
      dx: (Math.random()-0.5)*0.2,
      dy: (Math.random()-0.5)*0.2,
      alpha: Math.random()*0.5+0.2
    });
  }

  function animate(){
    ctx.clearRect(0,0,w,h);
    particles.forEach(p=>{
      p.x += p.dx;
      p.y += p.dy;
      if(p.x>w) p.x=0;
      if(p.x<0) p.x=w;
      if(p.y>h) p.y=0;
      if(p.y<0) p.y=h;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = `rgba(179,107,255,${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener("resize", ()=>{
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  });
});
