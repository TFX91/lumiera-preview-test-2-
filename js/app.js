/* ==========================
   APP.JS - FULL LUXURY LEVEL 999 + DOLADENIA
========================== */
window.artifactsState = window.artifactsState || {
  modalData: {},
  personality: { uvMode: localStorage.getItem("ln_uv") === "true" },
  wishlist: [],
  scrollDepth: 0,
  ephemeralContent: {},
  manifestShown: false,
  behavior: {
    visits: Number(localStorage.getItem("ln_visits") || 0),
    uvClicks: Number(localStorage.getItem("ln_uv_clicks") || 0),
    wishlistAdds: 0,
    modalOpens: 0,
    lastSeen: Date.now(),
    scrollType: "slow",
    age: 0
  }
};

/* ==========================
   AGE & VISITS
========================== */
const born = Number(localStorage.getItem("ln_born") || Date.now());
localStorage.setItem("ln_born", born);
artifactsState.behavior.age = Math.floor((Date.now() - born)/(1000*60*60*24));
artifactsState.behavior.visits++;
localStorage.setItem("ln_visits", artifactsState.behavior.visits);

/* ==========================
   LOGO & UV
========================== */
const logo = document.querySelector(".logo");
if(logo) {
  if(artifactsState.personality.uvMode) document.body.classList.add("uv");
  logo.addEventListener("click", () => {
    document.body.classList.toggle("uv");
    artifactsState.personality.uvMode = document.body.classList.contains("uv");
    localStorage.setItem("ln_uv", artifactsState.personality.uvMode);
    artifactsState.behavior.uvClicks++;
    localStorage.setItem("ln_uv_clicks", artifactsState.behavior.uvClicks);
    silentFeedback();
  });
  let pulse = true;
  setInterval(() => {
    logo.style.transform = pulse ? "scale(1.08) rotate(-1deg)" : "scale(1) rotate(0deg)";
    logo.style.textShadow = pulse ? "0 0 16px var(--uv),0 0 24px var(--uv)" : "0 0 0 var(--uv)";
    pulse = !pulse;
  }, 1500);
}

/* ==========================
   COLLECTION
========================== */
window.collection = [];
const gridContainer = document.querySelector(".grid");
for(let i=1;i<=20;i++){
  window.collection.push({
    id:`p${i}`,
    name:`Artefakt #${i}`,
    price:Math.round((Math.random()*200+99)/5)*5,
    desc:`Luxusný artefakt č.${i}`,
    variant:["Classic","Limited","Bez kompromisov"],
    imgA:`https://picsum.photos/seed/art${i}/400/400`,
    imgB:`https://picsum.photos/seed/art${i}b/400/400`,
    visibilityScore: Math.random(),
    memoryWeight: Math.random(),
    secretVariant:null
  });
}

/* ==========================
   RENDER COLLECTION & ENHANCE
========================== */
function renderCollection(){
  if(!gridContainer) return;
  gridContainer.innerHTML="";
  collection.forEach(product=>{
    if(product.visibilityScore<0.15 && artifactsState.behavior.visits<3) return;
    if(artifactsState.behavior.age>7 && product.memoryWeight<0.1) return;
    const div=document.createElement("div");
    div.className="product";
    div.innerHTML=`
      <img src="${product.imgA}" loading="lazy">
      <h4>${product.name}</h4>
      <p>${product.price} €</p>
    `;
    div.addEventListener("click",()=>openModal(product));
    enhanceProduct(div);
    gridContainer.appendChild(div);
  });
}

/* ==========================
   PRODUCT HOVER & 3D EFFECT
========================== */
function enhanceProduct(productEl){
  productEl.addEventListener("mouseenter",()=>{
    productEl.style.transform="perspective(800px) rotateX(3deg) rotateY(4deg) scale(1.06)";
    productEl.style.boxShadow="0 0 48px var(--uv),0 0 64px var(--uv)";
  });
  productEl.addEventListener("mouseleave",()=>{
    productEl.style.transform="scale(1)";
    productEl.style.boxShadow="0 0 28px var(--uv)";
  });
  productEl.addEventListener("click",()=>{
    productEl.style.transition="transform 0.2s ease";
    productEl.style.transform+=" scale(1.02)";
    setTimeout(()=>productEl.style.transform="scale(1)",180);
  });
}

/* ==========================
   SECRET VARIANTS
========================== */
function assignSecretVariants(){
  collection.forEach(p=>{
    if(artifactsState.behavior.uvClicks>=5 && !p.secretVariant){
      p.secretVariant={name:p.name+" ✦ Secret Edition",img:`https://picsum.photos/seed/secret${p.id}/400/400`};
    }
  });
}
assignSecretVariants();

/* ==========================
   MODAL & ENHANCEMENTS
========================== */
const modal=document.getElementById("modal"),
      modalImg=document.getElementById("modalImg"),
      modalName=document.getElementById("modalName"),
      modalDesc=document.getElementById("modalDesc"),
      modalVariant=document.getElementById("modalVariant");

window.openModal=function(product){
  artifactsState.behavior.modalOpens++;
  artifactsState.modalData={...product,uv:false};
  modal.style.display="flex";
  document.body.style.overflow="hidden";

  modalImg.src=product.imgA;
  modalImg.style.transform="scale(0.95) rotate(-1deg)";
  modalImg.style.boxShadow="0 0 0 var(--uv)";
  setTimeout(()=>{
    modalImg.style.transform="scale(1) rotate(0deg)";
    modalImg.style.boxShadow="0 0 40px var(--uv),0 0 56px var(--uv)";
  },60);

  modalName.innerText=product.name;
  modalDesc.innerText=product.desc;
  modalVariant.innerHTML=product.variant.map(v=>`<option>${v}</option>`).join("");

  if(product.secretVariant && !Array.from(modalVariant.options).some(o=>o.textContent===product.secretVariant.name)){
    const option=document.createElement("option");
    option.textContent=product.secretVariant.name;
    modalVariant.appendChild(option);
  }

  if(artifactsState.behavior.modalOpens===3) showEphemeral("Niektoré veci sa neukazujú každému.");
};

window.closeModal=function(){modal.style.display="none";document.body.style.overflow="";};
window.toggleUV=function(){artifactsState.modalData.uv=!artifactsState.modalData.uv;modalImg.src=artifactsState.modalData.uv?artifactsState.modalData.imgB:artifactsState.modalData.imgA;};

/* ==========================
   EPHEMERAL FLOAT
========================== */
function showEphemeral(msg){
  const e=document.createElement("div");
  e.className="ephemeral";
  e.innerText=msg;
  e.style.transform="translateX(-50%) translateY(10px)";
  document.body.appendChild(e);
  setTimeout(()=>e.classList.add("show"),50);
  setTimeout(()=>e.style.transform="translateX(-50%) translateY(-50px)",50);
  setTimeout(()=>e.remove(),5000);
}

/* ==========================
   ADAPTIVE ORGANISM LOOP
========================== */
(function adaptiveOrganism(){
  const perception={scrollHistory:[],hoverHistory:new Map(),lastActivity:Date.now()};

  function registerActivity(type,el){perception.lastActivity=Date.now();
    if(type==="hover"&&el) perception.hoverHistory.set(el,(perception.hoverHistory.get(el)||0)+1);
    if(type==="scroll") perception.scrollHistory.push(window.scrollY);
  }

  function adaptiveProducts(){
    collection.forEach(product=>{
      const el=document.querySelector(`.product:nth-child(${collection.indexOf(product)+1})`);
      if(!el) return;
      const hoverCount=perception.hoverHistory.get(el)||0;
      if(hoverCount>=3){el.style.transform="scale(1.04)";el.style.boxShadow="0 0 48px var(--uv)";}
      else{el.style.transform="scale(1)";el.style.boxShadow="0 0 28px var(--uv)";}
      if(hoverCount===0&&artifactsState.behavior.age>10){el.style.opacity="0.7";}
      else{el.style.opacity="1";}
    });
  }

  function adaptiveEphemeral(){
    const now=Date.now();
    if(now-perception.lastActivity>15000 && artifactsState.behavior.visits>2){
      showEphemeral(["Niektoré veci čakajú, kým si ich všimneš.","Ticho nie je prázdne.","Každá voľba dozrieva vo svojom čase."][Math.floor(Math.random()*3)]);
    }
  }

  function adaptiveUV(){
    if(artifactsState.behavior.uvClicks>=7){
      document.body.classList.add("uv");
      collection.forEach(p=>{p.visibilityScore+=0.05*Math.random();});
      renderCollection();
    }
  }

  window.addEventListener("scroll",()=>{registerActivity("scroll");adaptiveProducts();});
  document.querySelectorAll(".product").forEach(p=>{p.addEventListener("mouseenter",()=>{registerActivity("hover",p);adaptiveProducts();});});
  setInterval(()=>{adaptiveEphemeral();adaptiveUV();},7000);
})();

/* ==========================
   PARTICLE BACKGROUND EFFECT
========================== */
(function particleBackground(){
  const canvas=document.createElement("canvas");
  canvas.style.position="fixed"; canvas.style.top=0; canvas.style.left=0;
  canvas.style.width="100%"; canvas.style.height="100%";
  canvas.style.pointerEvents="none"; canvas.style.zIndex="-3";
  document.body.appendChild(canvas);
  const ctx=canvas.getContext("2d");
  let particles=[];
  function resizeCanvas(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
  window.addEventListener("resize",resizeCanvas);
  resizeCanvas();

  for(let i=0;i<100;i++){
    particles.push({
      x:Math.random()*canvas.width,
      y:Math.random()*canvas.height,
      vx:(Math.random()-0.5)*0.5,
      vy:(Math.random()-0.5)*0.5,
      size:Math.random()*2+1,
      color:`rgba(179,107,255,${Math.random()*0.5})`
    });
  }

  function animateParticles(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>canvas.width) p.vx*=-1;
      if(p.y<0||p.y>canvas.height) p.vy*=-1;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
      ctx.fillStyle=p.color; ctx.fill();
    });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // particles react to cursor
  window.addEventListener("mousemove",e=>{
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    particles.forEach(p=>{
      const dx=e.clientX-p.x, dy=e.clientY-p.y, dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<100){p.vx+=dx*0.0005; p.vy+=dy*0.0005;}
    });
    document.querySelectorAll(".product").forEach(el=>{
      el.style.boxShadow=`0 0 28px var(--uv), ${x*20}px ${y*20}px 60px var(--uv)`;
    });
    if(modal.style.display==="flex"){
      modalImg.style.boxShadow=`${x*30}px ${y*30}px 70px var(--uv),0 0 40px var(--uv)`;
    }
  });
})();

/* ==========================
   WISHLIST
========================== */
function addToWishlist(product){
  if(!artifactsState.wishlist.find(p=>p.name===product.name)) artifactsState.wishlist.push(product),artifactsState.behavior.wishlistAdds++;
  if(artifactsState.behavior.wishlistAdds===1) showEphemeral("Uložené. Nie kvôli cene.");
  if(artifactsState.behavior.wishlistAdds===3) showEphemeral("Niektoré rozhodnutia dozrievajú.");
}

/* ==========================
   SILENT FEEDBACK
========================== */
let fbCooldown=false;
function silentFeedback(){if(fbCooldown) return; fbCooldown=true; setTimeout(()=>fbCooldown=false,120); const fb=document.createElement("div"); fb.className="silent-feedback"; document.body.appendChild(fb); setTimeout(()=>fb.remove(),300);}

/* ==========================
   INITIAL RENDER
========================== */
renderCollection();
