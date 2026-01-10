const CFG = window.CHB_COMMUNITY;


/* Mobile menu toggle */
const menuToggle = document.getElementById("menuToggle");
function setMenu(open){
  document.body.classList.toggle("menuOpen", !!open);
}
if(menuToggle){
  menuToggle.addEventListener("click", ()=>{
    const isOpen = document.body.classList.contains("menuOpen");
    setMenu(!isOpen);
  });
}
// Close drawer when tapping overlay (pseudo-element) by listening on body clicks
document.addEventListener("click", (e)=>{
  if(!document.body.classList.contains("menuOpen")) return;
  const side = document.querySelector(".sideMenu");
  const isClickInsideMenu = side && side.contains(e.target);
  const isToggle = menuToggle && menuToggle.contains(e.target);
  if(!isClickInsideMenu && !isToggle){
    setMenu(false);
  }
});


const signinScreen = document.getElementById("signinScreen");
const appScreen = document.getElementById("appScreen");

const nameInput = document.getElementById("nameInput");
const codeInput = document.getElementById("codeInput");
const signinBtn = document.getElementById("signinBtn");

const refreshBtn = document.getElementById("refreshBtn");
const postBtn = document.getElementById("postBtn");
const signoutBtn = document.getElementById("signoutBtn");
const copyNameBtn = document.getElementById("copyNameBtn");
const shopBtn = document.getElementById("shopBtn");
const welcomeNote = document.getElementById("welcomeNote");

const filtersPanel = document.getElementById("filtersPanel");
const channelFilter = document.getElementById("channelFilter");
const searchInput = document.getElementById("searchInput");

const feedEl = document.getElementById("feed");
const featuredFeedEl = document.getElementById("featuredFeed");
const mediaFeedEl = document.getElementById("mediaFeed");
const peopleListEl = document.getElementById("peopleList");

const openEventsBtn = document.getElementById("openEventsBtn");
const openFilesBtn = document.getElementById("openFilesBtn");

const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");

const tabs = Array.from(document.querySelectorAll(".tab"));
const views = {
  discussion: document.getElementById("view_discussion"),
  featured: document.getElementById("view_featured"),
  events: document.getElementById("view_events"),
  media: document.getElementById("view_media"),
  files: document.getElementById("view_files"),
  people: document.getElementById("view_people"),
};

let ALL_POSTS = [];

function showModal(html){
  modalBody.innerHTML = html;
  modal.classList.remove("hidden");
}
function hideModal(){ modal.classList.add("hidden"); }
closeModal.addEventListener("click", hideModal);
modal.addEventListener("click", (e)=> { if(e.target === modal) hideModal(); });

function escapeHtml(s){
  return String(s||"")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function parseCSV(text){
  const rows = [];
  let row = [], cur = "", inQuotes = false;
  for(let i=0;i<text.length;i++){
    const c = text[i];
    if(c === '"'){
      if(inQuotes && text[i+1] === '"'){ cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if(c === ',' && !inQuotes){
      row.push(cur); cur = "";
    } else if((c === '\n' || c === '\r') && !inQuotes){
      if(cur.length || row.length){ row.push(cur); rows.push(row); }
      row = []; cur = "";
      if(c === '\r' && text[i+1] === '\n') i++;
    } else {
      cur += c;
    }
  }
  if(cur.length || row.length){ row.push(cur); rows.push(row); }
  return rows;
}
function toObjects(rows){
  if(!rows.length) return [];
  const headers = rows[0].map(h => (h||"").trim());
  return rows.slice(1).map(r=>{
    const obj = {};
    headers.forEach((h, idx)=> obj[h] = (r[idx] ?? "").trim());
    return obj;
  });
}
function normalizeBool(v){ return String(v||"").trim().toLowerCase() === "true"; }
function normalizeStatus(v){
  const s = String(v||"").trim().toUpperCase();
  return s || "APPROVED";
}
function getField(obj, key){
  const name = CFG.FIELDS[key];
  return obj[name] ?? "";
}
function driveToDirect(url){
  if(!url) return "";
  const u = url.trim();
  const m1 = u.match(/drive\.google\.com\/file\/d\/([^/]+)\//);
  const m2 = u.match(/[?&]id=([^&]+)/);
  const id = (m1 && m1[1]) || (m2 && m2[1]);
  if(id) return `https://drive.google.com/uc?export=view&id=${id}`;
  return u;
}

function buildChannelOptions(){
  const list = (CFG.CHANNELS || []).filter(Boolean);
  channelFilter.innerHTML =
    `<option value="ALL">All Channels</option>` +
    list.map(c=> `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
}

function renderFeed(targetEl, posts, opts = {}){
  const onlyPinned = !!opts.onlyPinned;
  const onlyWithMedia = !!opts.onlyWithMedia;

  const selected = channelFilter.value;
  const q = (searchInput.value || "").trim().toLowerCase();

  const filtered = posts.filter(p=>{
    const status = normalizeStatus(getField(p,"status"));
    if(status === "HIDDEN") return false;

    if(onlyPinned && !normalizeBool(getField(p,"pinned"))) return false;

    const photoRaw = getField(p,"photo");
    if(onlyWithMedia && !String(photoRaw||"").trim()) return false;

    const ch = getField(p,"channel");
    if(opts.useFilters !== false){
      if(selected !== "ALL" && ch !== selected) return false;
      if(q){
        const hay = [getField(p,"name"), getField(p,"channel"), getField(p,"post")].join(" ").toLowerCase();
        if(!hay.includes(q)) return false;
      }
    }
    return true;
  });

  filtered.sort((a,b)=>{
    const ap = normalizeBool(getField(a,"pinned"));
    const bp = normalizeBool(getField(b,"pinned"));
    if(ap !== bp) return ap ? -1 : 1;
    const at = getField(a,"timestamp");
    const bt = getField(b,"timestamp");
    return bt.localeCompare(at);
  });

  targetEl.innerHTML = filtered.map((p)=>{
    const name = escapeHtml(getField(p,"name") || "Member");
    const ch = escapeHtml(getField(p,"channel") || "");
    const text = escapeHtml(getField(p,"post") || "");
    const ts = escapeHtml(getField(p,"timestamp") || "");
    const pinned = normalizeBool(getField(p,"pinned"));

    const photoRaw = getField(p,"photo");
    const photo = driveToDirect(photoRaw);
    const photoHtml = photo ? `
      <div class="photo">
        <img src="${escapeHtml(photo)}" alt="Community photo" loading="lazy" />
      </div>` : "";

    // Post ID = the post timestamp string. We keep it visible + copyable to make commenting easy.
    const postId = getField(p,"timestamp") || "";
    const postIdSafe = escapeHtml(postId);

    return `
      <article class="card ${pinned ? "pinned":""}">
        <div class="meta">
          <div class="metaTop">
            <div><span class="name">${name}</span> <span class="tag">${ch}</span></div>
            <button class="btn tiny copyPostId" type="button" data-postid="${postIdSafe}">Copy Post ID</button>
          </div>
          <div>${ts}${pinned ? " · 📌 Pinned" : ""}</div>
        </div>
        <div class="text">${text}</div>
        ${photoHtml}
      </article>
    `;
  }).join("") || `<div class="card">Nothing here yet.</div>`;
}

function renderPeople(posts){
  // Unique names pulled from approved posts
  const names = new Map(); // name -> count
  posts.forEach(p=>{
    const status = normalizeStatus(getField(p,"status"));
    if(status === "HIDDEN") return;
    const n = (getField(p,"name") || "").trim();
    if(!n) return;
    names.set(n, (names.get(n) || 0) + 1);
  });

  const sorted = Array.from(names.entries()).sort((a,b)=> b[1]-a[1] || a[0].localeCompare(b[0]));
  peopleListEl.innerHTML = sorted.map(([name, count])=>`
    <div class="personCard">
      <div class="personName">${escapeHtml(name)}</div>
      <div class="personMeta">${count} post${count===1?"":"s"} shared</div>
    </div>
  `).join("") || `<div class="panel"><div class="note">No members yet. Once posts come in, names appear here.</div></div>`;
}

async function loadFeed(){
  if(!CFG.FEED_CSV_URL || CFG.FEED_CSV_URL.includes("PASTE_")){
    showModal(`
      <div style="margin-bottom:10px"><b>One-time setup:</b></div>
      <div>1) Publish your Google Sheet responses tab to the web as <b>CSV</b>.</div>
      <div>2) Paste the CSV link into <b>config.js</b> → <b>FEED_CSV_URL</b>.</div>
      <div style="margin-top:10px">Then refresh.</div>
    `);
    feedEl.innerHTML = `<div class="card">Add your published Sheet CSV link in config.js to load posts.</div>`;
    return;
  }

  feedEl.innerHTML = `<div class="card">Loading posts…</div>`;
  try{
    const res = await fetch(CFG.FEED_CSV_URL, { cache: "no-store" });
    if(!res.ok){
      feedEl.innerHTML = `<div class="card">Couldn’t load the feed. Double-check your CSV link.</div>`;
      return;
    }
    const csv = await res.text();
    const rows = parseCSV(csv);
    ALL_POSTS = toObjects(rows);

    // render all views
    renderFeed(feedEl, ALL_POSTS, { useFilters: true });
    renderFeed(featuredFeedEl, ALL_POSTS, { onlyPinned: true, useFilters: false });
    renderFeed(mediaFeedEl, ALL_POSTS, { onlyWithMedia: true, useFilters: false });
    renderPeople(ALL_POSTS);
  } catch(e){
    feedEl.innerHTML = `<div class="card">Feed load error. Publish the sheet as CSV and try again.</div>`;
  }
}

function openPostForm(){
  if(!CFG.POST_FORM_URL || CFG.POST_FORM_URL.includes("PASTE_")){
    showModal(`<div>Add your Google Form link in <b>config.js</b> → <b>POST_FORM_URL</b>.</div>`);
    return;
  }
  window.open(CFG.POST_FORM_URL, "_blank", "noopener");
}
function openShop(){
  if(!CFG.SHOP_URL || CFG.SHOP_URL.includes("PASTE_")){
    showModal(`<div>Add your shop link in <b>config.js</b> → <b>SHOP_URL</b>.</div>`);
    return;
  }
  window.open(CFG.SHOP_URL, "_blank", "noopener");
}
function openEvents(){
  if(!CFG.EVENTS_URL || CFG.EVENTS_URL.includes("PASTE_")){
    showModal(`<div>Add your events link in <b>config.js</b> → <b>EVENTS_URL</b>.</div>`);
    return;
  }
  window.open(CFG.EVENTS_URL, "_blank", "noopener");
}
function openFiles(){
  if(!CFG.FILES_URL || CFG.FILES_URL.includes("PASTE_")){
    showModal(`<div>Add your files link in <b>config.js</b> → <b>FILES_URL</b>.</div>`);
    return;
  }
  window.open(CFG.FILES_URL, "_blank", "noopener");
}

function copyText(text){
  if(!text) return;
  navigator.clipboard?.writeText(text);
  showModal(`<div>Copied to clipboard ✅</div><div style="margin-top:8px"><b>${escapeHtml(text)}</b></div>`);
}

// Copy Post ID button (uses the post Timestamp as the ID)
document.addEventListener("click", (e)=>{
  const btn = e.target.closest?.(".copyPostId");
  if(!btn) return;
  const id = btn.getAttribute("data-postid") || "";
  copyText(id);
});

function getSession(){
  return {
    name: localStorage.getItem("chb_name") || "",
    code: localStorage.getItem("chb_code") || ""
  };
}
function setSession(name, code){
  localStorage.setItem("chb_name", name);
  localStorage.setItem("chb_code", code || "");
}
function clearSession(){
  localStorage.removeItem("chb_name");
  localStorage.removeItem("chb_code");
}

function showApp(){
  signinScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");

  buildChannelOptions();
  const s = getSession();
  welcomeNote.textContent = `Signed in as ${s.name}${s.code ? " · Code: " + s.code : ""} · Tap Refresh to see new posts.`;

  shopBtn.href = (CFG.SHOP_URL && !CFG.SHOP_URL.includes("PASTE_")) ? CFG.SHOP_URL : "#";

  loadFeed();
}

function showSignin(){
  appScreen.classList.add("hidden");
  signinScreen.classList.remove("hidden");

  const s = getSession();
  nameInput.value = s.name || "";
  codeInput.value = s.code || "";
}

function switchTab(tabName){
  // toggle active tab button
  tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === tabName));

  // toggle views
  Object.keys(views).forEach(k => {
    views[k].classList.toggle("hidden", k !== tabName);
  });

  // show filters only for discussion
  const showFilters = (tabName === "discussion");
  filtersPanel.classList.toggle("hidden", !showFilters);

  // for tabs that need content, ensure we have data
  if(!ALL_POSTS.length) loadFeed();
}

tabs.forEach(t => t.addEventListener("click", ()=> switchTab(t.dataset.tab)));

signinBtn.addEventListener("click", ()=>{
  const name = (nameInput.value || "").trim();
  const code = (codeInput.value || "").trim();
  if(!name){
    showModal(`<div>Please enter your <b>Display Name</b> to continue.</div>`);
    return;
  }
  setSession(name, code);
  showApp();
});
signoutBtn.addEventListener("click", ()=>{ clearSession(); showSignin(); });

refreshBtn.addEventListener("click", ()=> loadFeed());
postBtn.addEventListener("click", ()=> openPostForm());
copyNameBtn.addEventListener("click", ()=> copyText(getSession().name));
shopBtn.addEventListener("click", (e)=>{
  if(!CFG.SHOP_URL || CFG.SHOP_URL.includes("PASTE_")){ e.preventDefault(); openShop(); }
});

openEventsBtn.addEventListener("click", openEvents);
openFilesBtn.addEventListener("click", openFiles);

// boot
(function init(){
  const s = getSession();
  if(s.name) showApp();
  else showSignin();
})();


/* Affiliate Menu Actions */
function openMenuLink(key, fallbackHtml){
  const urls = (CFG.MENU_URLS || {});
  const u = urls[key];
  if(!u || String(u).includes("PASTE_")){
    showModal(fallbackHtml);
    return;
  }
  window.open(u, "_blank", "noopener");
}

document.querySelectorAll('.menuItem').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const key = btn.dataset.menu;
    if(key === 'start') return openMenuLink('start', '<b>Start Here</b><br/>Paste your Start Here link in <b>config.js</b> → <b>MENU_URLS.start</b>.');
    if(key === 'training') return openMenuLink('training', '<b>Training</b><br/>Paste your Training link in <b>config.js</b> → <b>MENU_URLS.training</b>.');
    if(key === 'vault') return openMenuLink('vault', '<b>Content Vault</b><br/>Paste your Content Vault link in <b>config.js</b> → <b>MENU_URLS.vault</b>.');
    if(key === 'mediaAssets') return openMenuLink('mediaAssets', '<b>Media Assets</b><br/>Paste your Media Assets link in <b>config.js</b> → <b>MENU_URLS.mediaAssets</b>.');
    if(key === 'links') return openMenuLink('links', '<b>Important Links</b><br/>Paste your Important Links link in <b>config.js</b> → <b>MENU_URLS.links</b>.');
  });
});


// Close drawer after choosing a menu item (mobile)
document.querySelectorAll('.menuItem').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    if(window.matchMedia && window.matchMedia('(max-width: 899px)').matches){
      document.body.classList.remove('menuOpen');
    }
  });
});
