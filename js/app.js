/* app.js - Frontend logic for index page
   - Renders main cards sorted by popularity
   - On card click: shows subcards in same area (fade animations)
   - Back button / breadcrumb
   - Search with auto-suggestions (global or contextual)
   - Quick login modal (frontend demo)
*/

// ---------- Sample data: communities, subcategories, skills ----------
// In production these will come from backend APIs.
// Keep slugs lowercase and safe for URLs if needed.
const COMMUNITIES = [
  {
    id: "tech",
    name: "Tech - Software",
    colorVar: "--tech",
    emoji: "💻",
    popularity: 320,   // higher -> appears first
    subs: [
      { slug: "programming", name: "Programming", skills: ["Java", "Python", "JavaScript", "C++"] },
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
const closeModal = document.getElementById("closeModal");
const loginForm = document.getElementById("loginForm");
const signupBtn = document.getElementById("signupBtn");


// ---------- Utility rendering helpers ----------
function clearChildren(node) { while (node.firstChild) node.removeChild(node.firstChild); }

function createCard({ title, subtitle, emoji, gradientVar, popularity, onclick, hoverText }) {
  const card = document.createElement("div");
  card.className = "card";
  // inline gradient via CSS variable
  if (gradientVar) card.style.background = `var(${gradientVar})`;
  else card.style.background = "linear-gradient(135deg,#6b7280,#374151)";

  // popular badge
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

  // hover detail center
  const hover = document.createElement("div");
  hover.className = "hover-detail";
  hover.innerHTML = `<div style="font-weight:700;">Click to explore</div><div style="margin-top:4px; font-size:0.95rem; opacity:0.95;">${hoverText || ""}</div>`;
  card.appendChild(hover);

  if (typeof onclick === "function") {
    card.addEventListener("click", onclick);
    card.tabIndex = 0; // keyboard focus
    card.addEventListener("keypress", (e) => { if (e.key === "Enter") onclick(e); });
  }

  return card;
}


// ---------- Render Main Cards (sorted by popularity) ----------
function renderMainCards() {
  currentView = "main";
  activeCommunity = null;
  breadcrumbBar.setAttribute("aria-hidden", "true");
  clearChildren(cardsArea);

  // sort communities by popularity descending
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

// ---------- Show Subcards for a Community ----------
function openSubcards(communityId) {
  const comm = COMMUNITIES.find(x => x.id === communityId);
  if (!comm) return;
  currentView = "sub";
  activeCommunity = comm.id;

  // animate existing cards out, then replace
  const children = Array.from(cardsArea.children);
  children.forEach((ch, i) => {
    ch.classList.add("fade-out");
  });

  // after animation (safe 300ms), replace content
  setTimeout(() => {
    clearChildren(cardsArea);
    breadcrumbBar.setAttribute("aria-hidden", "false");
    breadcrumb.innerText = `Home / ${comm.name}`;

    // create a "main subcard" for each subcategory
    comm.subs.forEach(sub => {
      const card = createCard({
        title: sub.name,
        subtitle: `${sub.skills.length} skills`,
        emoji: "🧭",
        gradientVar: comm.colorVar,
        popularity: 0,
        hoverText: `Example skills: ${sub.skills.slice(0,4).join(", ")}`,
        onclick: () => openSkillPage(comm.id, sub.slug)
      });
      cardsArea.appendChild(card);
      card.classList.add("fade-in");
    });

    // add a small "show all" card (optional)
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


// ---------- Open skill page (placeholder) ----------
function openSkillPage(commId, subSlug) {
  // For MVP frontend, just show a placeholder view with sample actions
  const comm = COMMUNITIES.find(x => x.id === commId);
  const sub = comm?.subs.find(s => s.slug === subSlug);
  // fade out
  const children = Array.from(cardsArea.children);
  children.forEach(ch => ch.classList.add("fade-out"));

  setTimeout(() => {
    clearChildren(cardsArea);
    breadcrumb.innerText = `Home / ${comm.name} / ${sub ? sub.name : "All"}`;
    breadcrumbBar.setAttribute("aria-hidden", "false");

    // large header card / CTA
    const headerCard = document.createElement("div");
    headerCard.className = "card";
    headerCard.style.background = `var(${comm.colorVar})`;
    headerCard.style.minHeight = "120px";
    headerCard.innerHTML = `<div style="font-weight:800; font-size:1.05rem;">${sub ? sub.name : comm.name}</div>
      <div style="margin-top:8px; font-weight:600; opacity:0.95">${sub ? sub.skills.length + " skills" : comm.subs.length + " subcategories"}</div>
      <div style="margin-top:12px; display:flex; gap:8px; justify-content:center;">
        <button class="btn-primary" id="askBtn">Ask a question</button>
        <button class="btn-outline" id="joinBtn">Join community</button>
      </div>
    `;
    cardsArea.appendChild(headerCard);

    // sample question list (static example)
    const qListDiv = document.createElement("div");
    qListDiv.style.gridColumn = "1 / -1";
    qListDiv.innerHTML = `
      <h3 style="margin-top:18px">Recent questions</h3>
      <div class="card" style="background:linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9)); color:#0f1724;">
        <b>Scanner sc not working in Java</b>
        <div class="small" style="margin-top:8px">I get NoSuchElementException when reading input...</div>
      </div>
      <div class="card" style="background:linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9)); color:#0f1724;">
        <b>How to bake sourdough at home?</b>
        <div class="small" style="margin-top:8px">My dough collapses after proofing...</div>
      </div>
    `;
    cardsArea.appendChild(qListDiv);

    // add handlers demo
    const askBtn = document.getElementById("askBtn");
    if (askBtn) askBtn.addEventListener("click", () => alert("Ask question flow will open (requires login)."));

    // fade-in effects
    Array.from(cardsArea.children).forEach(ch => ch.classList.add("fade-in"));
  }, 280);
}

// ---------- Back to main ----------
backBtn.addEventListener("click", () => {
  breadcrumbBar.setAttribute("aria-hidden", "true");
  breadcrumb.innerText = "Home";
  // animate fade-out then render main
  const children = Array.from(cardsArea.children);
  children.forEach(ch => ch.classList.add("fade-out"));
  setTimeout(() => renderMainCards(), 260);
});


// ---------- Search & Suggestions ----------
// Build a flat suggestions list from data
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
      // route according to type
      if (item.type === "community") openSubcards(item.id);
      else if (item.type === "subcategory") openSubcards(item.id) , setTimeout(()=> {
        // try to auto-open sub (if present)
        const comm = COMMUNITIES.find(c => c.id === item.id);
        const sub = comm?.subs.find(s => s.slug === item.subSlug);
        if (sub) openSkillPage(item.id, item.subSlug);
      }, 320);
      else if (item.type === "skill") openSubcards(item.id), setTimeout(()=> openSkillPage(item.id, item.subSlug), 320);
    });
    suggestionsBox.appendChild(div);
  });
  suggestionsBox.style.display = "block";
}

// basic search logic: adapt to context (main OR sub)
searchInput.addEventListener("input", function (e) {
  const q = (e.target.value || "").trim().toLowerCase();
  if (!q) { suggestionsBox.style.display = "none"; return; }

  // If in sub view, search inside that community only (contextual)
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

  // Global search across all suggestions
  const matches = SUGS.filter(s => s.label.toLowerCase().includes(q));
  showSuggestions(matches.slice(0, 8));
});

// close suggestions when clicking outside
document.addEventListener("click", (e) => {
  if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
    suggestionsBox.style.display = "none";
  }
});

// handle Enter key in search to go to first match
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const first = suggestionsBox.querySelector(".sug");
    if (first) first.click();
  }
});


// ---------- Login modal (frontend demo) ----------
function openModal() {
  loginModal.setAttribute("aria-hidden", "false");
}
function closeModalFn() {
  loginModal.setAttribute("aria-hidden", "true");
}
loginBtn.addEventListener("click", openModal);
closeModal.addEventListener("click", closeModalFn);
loginForm.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const name = document.getElementById("nameInput").value.trim();
  const email = document.getElementById("emailInput").value.trim();
  if (!name || !email) return alert("Please enter name and email.");
  // Demo: store to localStorage and update UI
  localStorage.setItem("ss_user", JSON.stringify({ name, email }));
  loginBtn.innerText = `Hi, ${name.split(" ")[0]}`;
  closeModalFn();
});

// Signup button demo - redirect to same modal for now
signupBtn.addEventListener("click", openModal);

// If already logged in (demo), update button
window.addEventListener("DOMContentLoaded", () => {
  const u = localStorage.getItem("ss_user");
  if (u) {
    const user = JSON.parse(u);
    loginBtn.innerText = `Hi, ${user.name.split(" ")[0]}`;
  }
  // initially render main
  renderMainCards();
});
