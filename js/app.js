/* app.js - Frontend logic for index page
   - Renders main cards sorted by popularity
   - On card click: shows subcards in same area (fade animations)
   - Back button / breadcrumb
   - Search with auto-suggestions (global or contextual)
   - Login / Signup integrated with Java backend
*/

// ---------- Sample data: communities, subcategories, skills ----------
const COMMUNITIES = [
  {
    id: "tech",
    name: "Tech - Software",
    colorVar: "--tech",
    emoji: "💻",
    popularity: 320,
    subs: [
      { slug: "programming", name: "Programming", skills: ["Java", "Python", "JavaScript"] },
      { slug: "web", name: "Web Dev", skills: ["HTML", "CSS", "React", "Django"] },
      { slug: "db", name: "Databases", skills: ["MySQL", "MongoDB", "Postgres"] }
    ]
  },
  {
    id: "diy",
    name: "DIY & Repair",
    colorVar: "--diy",
    emoji: "🔧",
    popularity: 160,
    subs: [
      { slug: "electronics", name: "Electronics", skills: ["Laptop Repair", "Soldering"] },
      { slug: "furniture", name: "Furniture", skills: ["Woodwork", "Assembly"] }
    ]
  },
  {
    id: "cooking",
    name: "Cooking & Baking",
    colorVar: "--cooking",
    emoji: "🍳",
    popularity: 210,
    subs: [
      { slug: "baking", name: "Baking", skills: ["Bread", "Cakes", "Cookies"] },
      { slug: "curry", name: "Spicy & Curries", skills: ["Indian Curries", "Thai"] }
    ]
  },
  {
    id: "art",
    name: "Art & Non-Tech",
    colorVar: "--nontech",
    emoji: "🎨",
    popularity: 110,
    subs: [
      { slug: "design", name: "Design", skills: ["Graphic Design", "Photoshop"] },
      { slug: "music", name: "Music", skills: ["Guitar", "Piano"] }
    ]
  },
  {
    id: "edu",
    name: "Education & Tutoring",
    colorVar: "--education",
    emoji: "📚",
    popularity: 90,
    subs: [
      { slug: "languages", name: "Languages", skills: ["English", "Spanish"] },
      { slug: "math", name: "Math Help", skills: ["Algebra", "Calculus"] }
    ]
  }
];

// ---------- State ----------
let currentView = "main"; // "main" | "sub"
let activeCommunity = null; // community id when in sub view

// ---------- DOM elements ----------
const cardsArea = document.getElementById("cardsArea");
const backBtn = document.getElementById("backBtn");
const breadcrumbBar = document.getElementById("breadcrumbBar");
const breadcrumb = document.getElementById("breadcrumb");
const searchInput = document.getElementById("searchInput");
const suggestionsBox = document.getElementById("suggestions");
const loginBtn = document.getElementById("loginBtn");
const loginModal = document.getElementById("loginModal");
const closeModal1 = document.getElementById("closeModal1");
const closeModal2 = document.getElementById("closeModal2");
const loginForm = document.getElementById("loginForm");
const signupBtn = document.getElementById("signupBtn");
const signModal = document.getElementById("signModal");
const closeSign = document.getElementById("closeSign");
const sw_s = document.getElementById('switchS');
const sw_l = document.getElementById('switchL');
let u_name='';
let u_id=0;

// ---------- Utility functions ----------
function clearChildren(node) { while (node.firstChild) node.removeChild(node.firstChild); }

function createCard({ title, subtitle, emoji, gradientVar, popularity, onclick, hoverText }) {
  const card = document.createElement("div");
  card.className = "card";
  card.style.background = gradientVar ? `var(${gradientVar})` : "linear-gradient(135deg,#6b7280,#374151)";

  if (popularity && popularity > 0) {
    const pop = document.createElement("div");
    pop.className = "popular";
    pop.innerText = `★ ${Math.round(popularity)}`;
    card.appendChild(pop);
  }

  const icon = document.createElement("div");
  icon.className = "icon";
  icon.innerText = emoji || "⭐";
  card.appendChild(icon);

  const h3 = document.createElement("h3");
  h3.innerText = title || "Title";
  card.appendChild(h3);

  if (subtitle) {
    const p = document.createElement("p");
    p.innerText = subtitle;
    card.appendChild(p);
  }

  const hover = document.createElement("div");
  hover.className = "hover-detail";
  hover.innerHTML = `<div style="font-weight:700;">Click to explore</div><div style="margin-top:4px; font-size:0.95rem; opacity:0.95;">${hoverText || ""}</div>`;
  card.appendChild(hover);

  if (typeof onclick === "function") {
    card.addEventListener("click", onclick);
    card.tabIndex = 0;
    card.addEventListener("keypress", (e) => { if (e.key === "Enter") onclick(e); });
  }

  return card;
}

// ---------- Render main cards ----------
function renderMainCards() {
  currentView = "main";
  activeCommunity = null;
  breadcrumbBar.setAttribute("aria-hidden", "true");
  clearChildren(cardsArea);

  const list = [...COMMUNITIES].sort((a,b) => b.popularity - a.popularity);
  list.forEach(c => {
    const card = createCard({
      title: c.name,
      subtitle: `${c.subs.length} subcategories`,
      emoji: c.emoji,
      gradientVar: c.colorVar,
      popularity: c.popularity,
      hoverText: `Top skills: ${c.subs.slice(0,3).map(s => s.name).join(", ")}`,
      onclick: () => openSubcards(c.id)
    });
    cardsArea.appendChild(card);
    card.classList.add("fade-in");
  });
}

// ---------- Open subcards ----------
function openSubcards(communityId) {
  const comm = COMMUNITIES.find(x => x.id === communityId);
  if (!comm) return;
  currentView = "sub";
  activeCommunity = comm.id;

  Array.from(cardsArea.children).forEach(ch => ch.classList.add("fade-out"));
  setTimeout(() => {
    clearChildren(cardsArea);
    breadcrumbBar.setAttribute("aria-hidden", "false");
    breadcrumb.innerText = `Home / ${comm.name}`;

    comm.subs.forEach(sub => {
      const card = createCard({
        title: sub.name,
        subtitle: `${sub.skills.length} skills`,
        emoji: "🧭",
        gradientVar: comm.colorVar,
        hoverText: `Example skills: ${sub.skills.slice(0,4).join(", ")}`,
        onclick: () => openSkillPage(comm.id, sub.slug)
      });
      cardsArea.appendChild(card);
      card.classList.add("fade-in");
    });

    const showAll = createCard({
      title: `All ${comm.name} Skills`,
      subtitle: `Explore everything`,
      emoji: "📂",
      gradientVar: comm.colorVar,
      onclick: () => openSkillPage(comm.id, null),
      hoverText: "See all community questions and members"
    });
    cardsArea.appendChild(showAll);
    showAll.classList.add("fade-in");
  }, 280);
}

// ---------- Open skill page ----------
function openSkillPage(commId, subSlug) {
  const comm = COMMUNITIES.find(x => x.id === commId);
  const sub = comm?.subs.find(s => s.slug === subSlug);

  Array.from(cardsArea.children).forEach(ch => ch.classList.add("fade-out"));
  setTimeout(() => {
    clearChildren(cardsArea);
    breadcrumb.innerText = `Home / ${comm.name} / ${sub ? sub.name : "All"}`;
    breadcrumbBar.setAttribute("aria-hidden", "false");

    const headerCard = document.createElement("div");
    headerCard.className = "card";
    headerCard.style.background = `var(${comm.colorVar})`;
    headerCard.style.minHeight = "120px";
    headerCard.innerHTML = `<div style="font-weight:800; font-size:1.05rem;">${sub ? sub.name : comm.name}</div>
      <div style="margin-top:8px; font-weight:600; opacity:0.95">${sub ? sub.skills.length + " skills" : comm.subs.length + " subcategories"}</div>
      <div style="margin-top:12px; display:flex; gap:8px; justify-content:center;">
        <button class="btn-primary" id="askBtn">Ask a question</button>
        <button class="btn-outline" id="joinBtn">Join community</button>
      </div>`;
    cardsArea.appendChild(headerCard);

    const qListDiv = document.createElement("div");
    qListDiv.style.gridColumn = "1 / -1";
    qListDiv.innerHTML = `
      <h3 style="margin-top:18px">Recent questions</h3>
      <div class="card" style="margin: 10px; background:linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9)); color:#0f1724;">
        <b>Scanner sc not working in Java</b>
        <div class="small" style="margin-top:8px">I get NoSuchElementException when reading input...</div>
      </div>
      <div class="card" style="margin: 10px; background:linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9)); color:#0f1724;">
        <b>How to bake sourdough at home?</b>
        <div class="small" style="margin-top:8px">My dough collapses after proofing...</div>
      </div>`;
    cardsArea.appendChild(qListDiv);

    const askBtn = document.getElementById("askBtn");
    const joinBtn = document.getElementById("joinBtn");
    if (askBtn) askBtn.addEventListener("click", () =>{
      if(name!=null){
        window.location.assign("chat.html");
      }
      openModal(loginModal);
    } );
    joinBtn.addEventListener("click", () => window.location.assign("chat.html"));

    Array.from(cardsArea.children).forEach(ch => ch.classList.add("fade-in"));
  }, 280);
}

// ---------- Back button ----------
backBtn.addEventListener("click", () => {
  breadcrumbBar.setAttribute("aria-hidden", "true");
  breadcrumb.innerText = "Home";
  Array.from(cardsArea.children).forEach(ch => ch.classList.add("fade-out"));
  setTimeout(() => renderMainCards(), 260);
});

// ---------- LogoutBTN button ----------
const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("loggedInUser");
  loginBtn.innerText = "Login";
  signupBtn.style.display = 'block';
  logoutBtn.style.display = 'none';
  loginBtn.style.pointerEvents = 'auto';

});


// ---------- Search ----------
function buildSuggestionsList() {
  const suggestions = [];
  COMMUNITIES.forEach(c => {
    suggestions.push({ type: "community", id: c.id, label: c.name });
    c.subs.forEach(s => {
      suggestions.push({ type: "subcategory", id: c.id, subSlug: s.slug, label: `${s.name} — ${c.name}` });
      s.skills.forEach(skill => {
        suggestions.push({ type: "skill", id: c.id, subSlug: s.slug, label: `${skill} — ${s.name} — ${c.name}`, skillName: skill });
      });
    });
  });
  return suggestions;
}
const SUGS = buildSuggestionsList();

function showSuggestions(list) {
  clearChildren(suggestionsBox);
  if (!list.length) { suggestionsBox.style.display = "none"; return; }
  list.forEach(item => {
    const div = document.createElement("div");
    div.className = "sug";
    div.tabIndex = 0;
    div.innerText = item.label;
    div.addEventListener("click", () => {
      suggestionsBox.style.display = "none";
      if (item.type === "community") openSubcards(item.id);
      else if (item.type === "subcategory") openSubcards(item.id), setTimeout(()=> openSkillPage(item.id, item.subSlug), 320);
      else if (item.type === "skill") openSubcards(item.id), setTimeout(()=> openSkillPage(item.id, item.subSlug), 320);
    });
    suggestionsBox.appendChild(div);
  });
  suggestionsBox.style.display = "block";
}

searchInput.addEventListener("input", function (e) {
  const q = (e.target.value || "").trim().toLowerCase();
  if (!q) { suggestionsBox.style.display = "none"; return; }

  if (currentView === "sub" && activeCommunity) {
    const comm = COMMUNITIES.find(c => c.id === activeCommunity);
    const list = [];
    comm.subs.forEach(s => {
      if (s.name.toLowerCase().includes(q) || s.slug.includes(q)) list.push({ type: "subcategory", id: comm.id, subSlug: s.slug, label: `${s.name} — ${comm.name}`});
      s.skills.forEach(skill => {
        if (skill.toLowerCase().includes(q)) list.push({ type: "skill", id: comm.id, subSlug: s.slug, label: `${skill} — ${s.name} — ${comm.name}`, skillName: skill});
      });
    });
    showSuggestions(list.slice(0, 8));
    return;
  }

  const matches = SUGS.filter(s => s.label.toLowerCase().includes(q));
  showSuggestions(matches.slice(0, 8));
});

document.addEventListener("click", (e) => {
  if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
    suggestionsBox.style.display = "none";
  }
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const first = suggestionsBox.querySelector(".sug");
    if (first) first.click();
  }
});

// ---------- Modals ----------
function openModal(n) { n.setAttribute("aria-hidden", "false"); }
function closeModalFn(n) { n.setAttribute("aria-hidden", "true"); }

// ---------- Login with backend ----------
loginBtn.addEventListener("click", () => openModal(loginModal));
closeModal1.addEventListener("click", () => closeModalFn(loginModal));

loginForm.addEventListener("submit", async (ev) => {
  ev.preventDefault();

  const email = document.getElementById("emailInput").value.trim();
  const pass = document.getElementById("pass").value.trim();

  if (!email || !pass) return alert("Please enter email and password.");

  try {
    // 1️⃣ Login API
    const loginRes = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass })
    });

    const loginData = await loginRes.json();

    if (!loginRes.ok || !loginData.name) {
      return alert(loginData.message || "Invalid login");
    }

    // 2️⃣ Get name from DB using email
    const nameRes = await fetch("/api/getName", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const nameData = await nameRes.json();
    

    if (nameData) {
      u_id = nameData.id;
      u_name = nameData.name;
      console.log(u_id . u_name);
      // ✅ Store in localStorage so login persists on reload
      localStorage.setItem("loggedInUser", JSON.stringify({ id: u_id, name: u_name, email }));

      // ✅ Update UI
      loginBtn.innerText = `Hi, ${u_name.split(" ")[0]}`;
      signupBtn.style.display = 'none';
      logoutBtn.style.display = 'block';
      loginBtn.style.pointerEvents = 'none'; // ❌ WRONG
      loginBtn.style.pointerEvents = 'none'; // ✅ Correct usage

      closeModalFn(loginModal);
    } else {
      alert(nameData.message || "Name not found");
    }

  } catch (err) {
    console.error(err);
    alert("Server error. Check console.");
  }
});



// ---------- Signup with backend ----------
signupBtn.addEventListener("click", () => openModal(signModal));
closeModal2.addEventListener("click", () => closeModalFn(signModal));

signModal.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const name = document.getElementById("nameInputs").value.trim();
  const email = document.getElementById("emailInputs").value.trim();
  const pass = document.getElementById("passs").value.trim();
  if (!name || !email || !pass) return alert("Fill all fields");
  
  try {
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password: pass })
    });
    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("loggedInUser", JSON.stringify(data));

      loginBtn.innerText = `Hi, ${data.name.split(" ")[0]}`;
      signupBtn.style.display='none';
      logoutBtn.style.display='block';
      loginBtn.pointerEvents= 'none';

      closeModalFn(signModal);
    } else alert(data.message || "Signup failed");
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
});

// ---------- Switch between modals ----------
sw_s.addEventListener('click', () => { closeModalFn(loginModal); openModal(signModal); });
sw_l.addEventListener('click', () => { closeModalFn(signModal); openModal(loginModal); });

// ---------- Init ----------
window.addEventListener("DOMContentLoaded", () => {
  const loggedUser = localStorage.getItem("loggedInUser");
  if (loggedUser) {
    const user = JSON.parse(loggedUser);
    loginBtn.innerText = `Hi, ${user.name.split(" ")[0]}`;
    signupBtn.style.display = 'none';
    logoutBtn.style.display = 'block';
    loginBtn.style.pointerEvents = 'none';
    u_id = user.id;
    u_name = user.name;
  } else {
    signupBtn.style.display = 'block';
    logoutBtn.style.display = 'none';
    loginBtn.style.pointerEvents = 'unset';
  }

  // Render main cards
  renderMainCards();
});

