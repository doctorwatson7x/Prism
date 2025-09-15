// ====== CONFIG ======
document.getElementById("year").textContent = new Date().getFullYear();
const supabase = window.supabaseClient;

// ====== COPY ======
const COPY = {
  home: {
    storiesTitle: "Stories",
    storiesSubtitle: "Write and read entries (cloud synced)",
    storiesCta: "Go to Stories →",
    funTitle: "Fun",
    funSubtitle: "Tiny toys",
    funCta: "Go to Fun →",
    aboutTitle: "Experimental website",
    aboutBody:
      "This theme uses glassy panels, neon glows, and a star-field grid to nail the “refined alien cruiser” vibe. Lightweight, single-file, and cloud-synced via Supabase.",
    cockpitTitle: "Ship Console",
    cockpitSubtitle: "Alien dials, toggles, EQ & sliders (vibes)",
  },
  identity: {
    title: "Identity",
    subtitle: "Password optional — use it to reserve your pen name.",
    penPlaceholder: "Pen name",
    pwPlaceholder: "Password (optional to reserve pen)",
    saveBtn: "Save / Reserve",
  },
  compose: {
    title: "Write a story",
    placeholder: "Share a thought… (max 2000 chars)",
  },
  feed: {
    title: "Community feed",
    subtitle: "Newest first · click a pen to filter",
    none: "No entries yet.",
    noneFor: (p) => `No entries yet for ${p}.`,
    back: "Back to all",
    reactionsLabel: (t) =>
      `Reactions: 👍 ${t["👍"] || 0} · 😂 ${t["😂"] || 0} · 🔥 ${
        t["🔥"] || 0
      } · 👽 ${t["👽"] || 0}`,
  },
  fun: {
    eyesTitle: "The Eyes",
    eyesSubtitle: "They follow your cursor…",
    trailTitle: "Cursor Trail",
    trailSubtitle: "Toggle neon particles following your cursor",
    trailEnable: "Enable trail",
    trailDisable: "Disable trail",
    quotesTitle: "Random Quote",
    quotesSubtitle: "Jokes, sci-fi, fortunes, philosophy",
    quotesButton: "Generate",
    blobTitle: "Pet Blob",
    blobSubtitle: "Customize color & size",
    blobColor: "Color:",
    blobSize: "Size:",
    diceTitle: "Dice",
    diceSubtitle: "Roll a d6",
  },
  gallery: {
    title: "Gallery",
    subtitle: "Endless scroll • Alien glass frames",
    uploadBtn: "Upload artwork",
    sumPH: "Optional summary (caption)",
    tip: "Supported: images & videos (jpg, png, webp, gif, mp4, webm, mov…)",
  },
};

// ====== helpers ======
function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const k in attrs) {
    if (k.startsWith("on") && typeof attrs[k] === "function") {
      el.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
    } else if (k === "html") {
      el.innerHTML = attrs[k];
    } else {
      el.setAttribute(k, attrs[k]);
    }
  }
  for (const c of children) {
    if (c == null) continue;
    el.append(c.nodeType ? c : document.createTextNode(c));
  }
  return el;
}
const SVG_NS = "http://www.w3.org/2000/svg";
function hs(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}

const esc = (s) =>
  String(s ?? "").replace(/[<>]/g, (m) => ({ "<": "&lt;", ">": "&gt;" }[m]));
const choose = (arr) => arr[Math.floor(Math.random() * arr.length)];
function setActiveNav() {
  const hash = location.hash || "#home";
  document
    .querySelectorAll("nav a")
    .forEach((a) => a.classList.remove("active"));
  if (hash.startsWith("#stories"))
    document.getElementById("navStories").classList.add("active");
  else if (hash.startsWith("#fun"))
    document.getElementById("navFun").classList.add("active");
  else if (hash.startsWith("#gallery"))
    document.getElementById("navGallery").classList.add("active");
  else document.getElementById("navHome").classList.add("active");
}
function Card(title, subtitle, body) {
  const head = h(
    "div",
    {
      style:
        "display:flex;justify-content:space-between;gap:12px;align-items:flex-start",
    },
    h(
      "div",
      {},
      h("div", { style: "font-weight:600;font-size:18px" }, title),
      subtitle
        ? h("div", { class: "muted", style: "margin-top:4px" }, subtitle)
        : null
    )
  );
  const card = h("div", { class: "card" });
  card.append(head, h("div", { style: "margin-top:14px" }, body));
  return card;
}

// ====== Masks & Identity ======
const LAST_PEN_KEY = "prism_last_pen";
const LAST_MASK_KEY = "prism_last_mask";
const MASKS = [
  "Grey",
  "Reptilian",
  "Nordic",
  "Insectoid",
  "Cyborg Alien",
  "Retro Martian",
  "Roswell Cartoon",
  "Xeno-Beast",
  "Space Wizard",
  "Cosmic Jellyfish",
  "Nebula Face",
  "Crystal Skull",
  "Obsidian Fox",
  "Solar Phantom",
  "Void Wraith",
];

function maskSVG(type, size = 24) {
  const svg = (inner) => {
    const s = hs("svg", {
      viewBox: "0 0 64 64",
      width: String(size),
      height: String(size),
    });
    s.style.filter = "drop-shadow(0 0 6px rgba(99,102,241,.6))";
    s.innerHTML = inner;
    return s;
  };
  const glow = "#7c83ff",
    line = "#bcd3ff";
  switch (type) {
    case "Grey":
      return svg(
        `<ellipse cx="32" cy="36" rx="18" ry="22" fill="none" stroke="${glow}" stroke-width="2"/><ellipse cx="24" cy="36" rx="6" ry="8" fill="${line}"/><ellipse cx="40" cy="36" rx="6" ry="8" fill="${line}"/>`
      );
    case "Reptilian":
      return svg(
        `<path d="M12 40 Q32 10 52 40 Q32 58 12 40Z" fill="none" stroke="${glow}" stroke-width="2"/><path d="M22 36 Q26 32 30 36" stroke="${line}" stroke-width="3"/><path d="M34 36 Q38 32 42 36" stroke="${line}" stroke-width="3"/>`
      );
    case "Nordic":
      return svg(
        `<circle cx="32" cy="32" r="18" fill="none" stroke="${glow}" stroke-width="2"/><circle cx="26" cy="30" r="3" fill="${line}"/><circle cx="38" cy="30" r="3" fill="${line}"/>`
      );
    case "Insectoid":
      return svg(
        `<ellipse cx="32" cy="34" rx="20" ry="16" fill="none" stroke="${glow}" stroke-width="2"/><ellipse cx="24" cy="34" rx="7" ry="9" fill="${line}"/><ellipse cx="40" cy="34" rx="7" ry="9" fill="${line}"/>`
      );
    case "Cyborg Alien":
      return svg(
        `<rect x="16" y="16" width="32" height="32" rx="10" fill="none" stroke="${glow}" stroke-width="2"/><circle cx="26" cy="32" r="5" fill="${line}"/><rect x="34" y="28" width="12" height="8" fill="${line}"/>`
      );
    case "Retro Martian":
      return svg(
        `<circle cx="32" cy="34" r="16" fill="none" stroke="${glow}" stroke-width="2"/><line x1="28" y1="18" x2="24" y2="10" stroke="${line}" stroke-width="2"/><line x1="36" y1="18" x2="40" y2="10" stroke="${line}" stroke-width="2"/>`
      );
    case "Roswell Cartoon":
      return svg(
        `<ellipse cx="32" cy="34" rx="16" ry="18" fill="none" stroke="${glow}" stroke-width="2"/><circle cx="26" cy="34" r="5" fill="${line}"/><circle cx="38" cy="34" r="5" fill="${line}"/>`
      );
    case "Xeno-Beast":
      return svg(
        `<path d="M16 46 Q32 10 48 46" fill="none" stroke="${glow}" stroke-width="2"/><path d="M22 34 L28 36" stroke="${line}" stroke-width="3"/><path d="M42 34 L36 36" stroke="${line}" stroke-width="3"/>`
      );
    case "Space Wizard":
      return svg(
        `<path d="M12 28 L32 8 L52 28 V52 H12Z" fill="none" stroke="${glow}" stroke-width="2"/><circle cx="32" cy="36" r="4" fill="${line}"/>`
      );
    case "Cosmic Jellyfish":
      return svg(
        `<circle cx="32" cy="28" r="12" fill="none" stroke="${glow}" stroke-width="2"/><path d="M20 40 Q24 48 28 40 Q32 48 36 40 Q40 48 44 40" stroke="${line}" stroke-width="2" fill="none"/>`
      );
    case "Nebula Face":
      return svg(
        `<circle cx="32" cy="32" r="18" fill="none" stroke="${glow}" stroke-width="2"/><circle cx="26" cy="30" r="2" fill="${line}"/><circle cx="38" cy="34" r="2" fill="${line}"/>`
      );
    case "Crystal Skull":
      return svg(
        `<path d="M20 18 H44 V40 L32 50 L20 40 Z" fill="none" stroke="${glow}" stroke-width="2"/><line x1="20" y1="28" x2="44" y2="28" stroke="${line}" stroke-width="2"/>`
      );
    case "Obsidian Fox":
      return svg(
        `<path d="M16 28 L24 16 L32 26 L40 16 L48 28 V48 H16Z" fill="none" stroke="${glow}" stroke-width="2"/><circle cx="26" cy="34" r="3" fill="${line}"/><circle cx="38" cy="34" r="3" fill="${line}"/>`
      );
    case "Solar Phantom":
      return svg(
        `<circle cx="32" cy="32" r="16" fill="none" stroke="${glow}" stroke-width="2"/><path d="M16 32 A16 16 0 0 0 48 32" stroke="${line}" stroke-width="2" fill="none"/>`
      );
    case "Void Wraith":
      return svg(
        `<path d="M16 20 Q32 10 48 20 V48 H16Z" fill="none" stroke="${glow}" stroke-width="2"/><circle cx="28" cy="30" r="2" fill="${line}"/><circle cx="36" cy="30" r="2" fill="${line}"/>`
      );
    default:
      return svg(
        `<circle cx="32" cy="32" r="18" fill="none" stroke="${glow}" stroke-width="2"/>`
      );
  }
}

function updateIdentityBadge() {
  const el = document.getElementById("identityBadge");
  const pen = localStorage.getItem(LAST_PEN_KEY) || "Guest";
  const mask = localStorage.getItem(LAST_MASK_KEY) || "Grey";
  el.innerHTML = "";
  el.append(
    maskSVG(mask, 18),
    h("span", {}, pen),
    h("span", { class: "muted" }, `(${mask})`)
  );
}

// ====== DB ops ======
const ALLOWED_EMOJIS = ["👍", "😂", "🔥", "👽"];
async function dbFetchStories() {
  return await supabase
    .from("stories")
    .select("id, pen, text, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
}
async function dbFetchStoriesByPen(pen) {
  return await supabase
    .from("stories")
    .select("id, pen, text, created_at")
    .eq("pen", pen)
    .order("created_at", { ascending: false })
    .limit(200);
}
async function dbInsertStory(pen, text) {
  return await supabase.from("stories").insert([{ pen, text }]).select();
}
async function dbInsertComment(story_id, pen, text) {
  return await supabase
    .from("comments")
    .insert([{ story_id, pen, text }])
    .select();
}
async function dbFetchComments(story_id) {
  return await supabase
    .from("comments")
    .select("id, story_id, pen, text, created_at")
    .eq("story_id", story_id)
    .order("created_at", { ascending: true });
}
async function dbReact(story_id, pen, emoji) {
  await supabase.from("reactions").delete().match({ story_id, pen, emoji });
  return await supabase
    .from("reactions")
    .insert([{ story_id, pen, emoji }])
    .select();
}
async function dbReactionTotals(story_id) {
  const { data } = await supabase
    .from("reactions")
    .select("emoji")
    .eq("story_id", story_id);
  const totals = { "👍": 0, "😂": 0, "🔥": 0, "👽": 0 };
  (data || []).forEach((r) => {
    if (ALLOWED_EMOJIS.includes(r.emoji))
      totals[r.emoji] = (totals[r.emoji] || 0) + 1;
  });
  return { totals };
}
async function dbFetchUser(pen) {
  return await supabase
    .from("users")
    .select("pen, mask")
    .eq("pen", pen)
    .maybeSingle();
}
async function dbUpsertUser(pen, mask, password_hash) {
  return await supabase
    .from("users")
    .upsert([{ pen, mask, password_hash }], { onConflict: "pen" });
}

// Gallery tables
async function dbInsertGallery({ pen, mask, summary, url, mime }) {
  return await supabase
    .from("gallery_posts")
    .insert([{ pen, mask, summary, url, mime }])
    .select();
}
async function dbFetchGallery({ offset, limit }) {
  return await supabase
    .from("gallery_posts")
    .select("id, pen, mask, summary, url, mime, created_at")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
}

// Tracks (jukebox)
async function dbInsertTrack({ pen, mask, path }) {
  return await supabase.from("tracks").insert([{ pen, mask, path }]).select();
}
async function dbFetchTracks() {
  return await supabase
    .from("tracks")
    .select("id, pen, mask, path, created_at")
    .order("created_at", { ascending: true });
}

// ====== mask cache ======
const maskCache = new Map();
async function getMaskForPen(pen) {
  if (maskCache.has(pen)) return maskCache.get(pen);
  const p = dbFetchUser(pen).then(({ data }) =>
    data && data.mask ? data.mask : "Grey"
  );
  maskCache.set(pen, p);
  return p;
}

// ====== Pages ======
function Home() {
  const grid = h("section", { class: "grid" });
  grid.append(
    Card(
      COPY.home.storiesTitle,
      COPY.home.storiesSubtitle,
      h(
        "div",
        {},
        h(
          "a",
          { href: "#stories", style: "color:#c7d2fe" },
          COPY.home.storiesCta
        )
      )
    ),
    Card(
      "Gallery",
      "Endless neon frames",
      h(
        "div",
        {},
        h("a", { href: "#gallery", style: "color:#c7d2fe" }, "Go to Gallery →")
      )
    ),
    Card(
      COPY.home.funTitle,
      COPY.home.funSubtitle,
      h(
        "div",
        {},
        h("a", { href: "#fun", style: "color:#c7d2fe" }, COPY.home.funCta)
      )
    )
  );

  // Identity on Home
  const penInput = h("input", {
    placeholder: COPY.identity.penPlaceholder,
    maxlength: "40",
    value: localStorage.getItem(LAST_PEN_KEY) || "",
  });
  const pw = h("input", {
    type: "password",
    placeholder: COPY.identity.pwPlaceholder,
  });
  let currentMask = localStorage.getItem(LAST_MASK_KEY) || "Grey";
  const maskPreview = h("div", {
    class: "row",
    style: "gap:12px;align-items:center",
  });
  function renderPreview() {
    maskPreview.innerHTML = "";
    maskPreview.append(
      maskSVG(currentMask, 56),
      h("div", { class: "muted" }, currentMask)
    );
  }
  renderPreview();
  const maskGrid = h("div", { class: "panel" });
  function renderMaskGrid() {
    maskGrid.innerHTML = "";
    MASKS.forEach((name) => {
      const btn = h(
        "button",
        {
          class: "pill",
          style:
            "justify-content:flex-start;gap:10px;min-width:200px;background:rgba(99,102,241,.12);border-color:rgba(99,102,241,.35)",
        },
        maskSVG(name, 22),
        name
      );
      if (name === currentMask) {
        btn.style.outline = "2px solid rgba(99,102,241,.6)";
      }
      btn.addEventListener("click", () => {
        currentMask = name;
        localStorage.setItem(LAST_MASK_KEY, currentMask);
        renderPreview();
        updateIdentityBadge();
        renderMaskGrid();
      });
      maskGrid.append(btn);
    });
  }
  renderMaskGrid();
  async function reserve() {
    const p = penInput.value.trim();
    if (!p) return alert("Enter a pen name");
    const password = pw.value.trim() || null;
    const enc = (s) =>
      crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)).then((b) =>
        Array.from(new Uint8Array(b))
          .map((x) => x.toString(16).padStart(2, "0"))
          .join("")
      );
    const password_hash = password ? await enc(password) : null;
    const { error } = await dbUpsertUser(p, currentMask, password_hash);
    if (error) return alert("Could not reserve: " + error.message);
    localStorage.setItem(LAST_PEN_KEY, p);
    localStorage.setItem(LAST_MASK_KEY, currentMask);
    updateIdentityBadge();
    alert(password ? "Reserved! 🔒" : "Saved (guest)");
  }
  (async () => {
    const existingPen = penInput.value.trim();
    if (existingPen) {
      const { data } = await dbFetchUser(existingPen);
      if (data && data.mask) {
        currentMask = data.mask;
        localStorage.setItem(LAST_MASK_KEY, currentMask);
        renderPreview();
        updateIdentityBadge();
        renderMaskGrid();
      }
    }
  })();

  const identityCard = Card(
    "Identity",
    COPY.identity.subtitle,
    h(
      "div",
      {},
      h(
        "div",
        {
          class: "grid",
          style:
            "grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px",
        },
        penInput,
        pw
      ),
      h(
        "div",
        { style: "margin-top:8px" },
        h("div", { class: "muted" }, "Choose a mask:")
      ),
      maskPreview,
      maskGrid,
      h(
        "div",
        { class: "row", style: "margin-top:12px" },
        h("button", { class: "pill", onclick: reserve }, COPY.identity.saveBtn)
      )
    )
  );

  // Ship Console (vibes)
  const led = (color) => {
    const e = h("span", { class: "led" });
    e.style.color = color;
    e.style.background = color;
    return e;
  };
  const t1 = h(
    "div",
    {
      class: "toggle",
      onclick: (e) => e.currentTarget.classList.toggle("on"),
    },
    h("div", { class: "knob" })
  );
  const t2 = h(
    "div",
    {
      class: "toggle on",
      onclick: (e) => e.currentTarget.classList.toggle("on"),
    },
    h("div", { class: "knob" })
  );
  const dial1 = h("div", { class: "dial" }),
    dial2 = h("div", { class: "dial" });
  const eq = h(
    "div",
    { class: "eq" },
    ...Array.from({ length: 10 }, () =>
      h("span", {
        style: `height:${20 + Math.floor(Math.random() * 36)}px`,
      })
    )
  );
  const slider1 = h("input", {
    type: "range",
    min: "0",
    max: "100",
    value: "40",
    class: "slider",
  });
  const slider2 = h("input", {
    type: "range",
    min: "0",
    max: "100",
    value: "72",
    class: "slider",
  });
  const cockpit = Card(
    COPY.home.cockpitTitle,
    COPY.home.cockpitSubtitle,
    h(
      "div",
      { class: "panel" },
      h(
        "div",
        {},
        h(
          "div",
          { class: "row", style: "gap:10px;margin-bottom:10px" },
          led("#34d399"),
          led("#f59e0b"),
          led("#60a5fa"),
          led("#f472b6")
        ),
        t1,
        t2
      ),
      h("div", {}, dial1),
      h("div", {}, dial2),
      h(
        "div",
        {},
        h("div", { style: "margin-bottom:10px" }, "Engine Mix"),
        slider1
      ),
      h(
        "div",
        {},
        h("div", { style: "margin-bottom:10px" }, "Warp Flux"),
        slider2
      ),
      h("div", {}, h("div", { style: "margin-bottom:10px" }, "Comms EQ"), eq)
    )
  );

  const about = Card(
    COPY.home.aboutTitle,
    "",
    h("p", { class: "muted", html: COPY.home.aboutBody })
  );
  return h(
    "div",
    {},
    grid,
    h("div", { style: "height:12px" }),
    identityCard,
    h("div", { style: "height:12px" }),
    cockpit,
    h("div", { style: "height:12px" }),
    about
  );
}

function Stories() {
  const wrapper = h("div", {});
  let items = [];
  let viewingPen = null;
  const pen = localStorage.getItem(LAST_PEN_KEY) || "";
  const penNotice = h(
    "div",
    { class: "muted" },
    pen ? `Posting as ${pen}` : "Set your pen & mask on Home"
  );
  const text = h("textarea", {
    placeholder: COPY.compose.placeholder,
    maxlength: 2000,
  });
  const count = h("span", { class: "count" }, "0/2000");
  const postBtn = h(
    "button",
    { class: "pill", onclick: add, disabled: true },
    "Post"
  );
  const refreshBtn = h(
    "button",
    { class: "pill", onclick: () => load(true) },
    "Refresh"
  );
  function cooldownReady() {
    const last = Number(localStorage.getItem("prism_last_post_at") || 0);
    return Date.now() - last >= 10000;
  }
  function validate() {
    postBtn.disabled = !(
      (localStorage.getItem(LAST_PEN_KEY) || "").trim() &&
      text.value.trim() &&
      cooldownReady()
    );
  }
  text.addEventListener("input", () => {
    count.textContent = text.value.length + "/2000";
    validate();
  });
  const composeCard = Card(
    COPY.compose.title,
    "",
    h(
      "div",
      {},
      penNotice,
      h(
        "div",
        {
          class: "grid",
          style:
            "grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px; margin-top:8px",
        },
        text
      ),
      h(
        "div",
        {
          class: "row",
          style: "justify-content:space-between;margin-top:10px",
        },
        count,
        h("div", { class: "row" }, postBtn, refreshBtn)
      )
    )
  );
  const feedCard = Card(
    COPY.feed.title,
    COPY.feed.subtitle,
    h("div", {}, "Loading…")
  );
  const listBody = feedCard.lastChild;

  function isDup(p, t) {
    const clean = (s) => s.trim().replace(/\s+/g, " ");
    const now = Date.now();
    return items.some(
      (e) =>
        e.pen.trim() === clean(p) &&
        e.text.trim() === clean(t) &&
        now - new Date(e.created_at).getTime() < 120000
    );
  }
  async function add() {
    if (!cooldownReady()) return alert("Cooling down a few seconds…");
    const p = (localStorage.getItem(LAST_PEN_KEY) || "").trim(),
      t = text.value.trim();
    if (!p || !t) return alert("Set your pen on Home first");
    if (isDup(p, t)) return alert("Looks like you just posted that.");
    postBtn.textContent = "Posting…";
    postBtn.disabled = true;
    const { error } = await dbInsertStory(p, t);
    if (error) {
      alert("Could not post: " + error.message);
      postBtn.textContent = "Post";
      validate();
      return;
    }
    localStorage.setItem("prism_last_post_at", String(Date.now()));
    text.value = "";
    count.textContent = "0/2000";
    await load(true);
    postBtn.textContent = "Post";
    validate();
  }
  async function load(spinner) {
    if (spinner) listBody.innerHTML = "Loading…";
    const resp = viewingPen
      ? await dbFetchStoriesByPen(viewingPen)
      : await dbFetchStories();
    if (resp.error) {
      listBody.textContent = "Could not load: " + resp.error.message;
      return;
    }
    items = resp.data || [];
    renderList();
  }
  function renderList() {
    const ul = h("ul", { class: "list" });
    if (items.length === 0) {
      ul.append(
        h(
          "div",
          { class: "muted" },
          viewingPen ? COPY.feed.noneFor(viewingPen) : COPY.feed.none
        )
      );
    }
    items.forEach((it) => {
      const li = h("li", { class: "post", style: "margin-top:12px" });
      const penLink = h(
        "a",
        { href: "#stories", style: "color:#a5b4fc;font-weight:600" },
        esc(it.pen)
      );
      penLink.addEventListener("click", (e) => {
        e.preventDefault();
        viewingPen = it.pen;
        load(true);
      });
      const maskHolder = h("span", {
        style:
          "display:inline-flex;align-items:center;margin-left:6px;vertical-align:-2px",
      });
      getMaskForPen(it.pen).then((m) => {
        maskHolder.innerHTML = "";
        maskHolder.append(maskSVG(m, 16));
      });

      const header = h(
        "div",
        { class: "row", style: "justify-content:space-between" },
        h("div", {}, penLink, maskHolder),
        h("time", { class: "muted" }, new Date(it.created_at).toLocaleString())
      );
      const body = h(
        "div",
        { style: "margin-top:8px; white-space:pre-wrap" },
        esc(it.text)
      );
      const reactRow = h("div", {
        class: "reactions",
        style: "margin-top:10px",
      });
      const totalsEl = h("div", {
        class: "muted",
        style: "margin-left:6px",
      });
      ALLOWED_EMOJIS.forEach((em) => {
        reactRow.append(
          h(
            "span",
            {
              class: "pill",
              onclick: () => toggleReact(it.id, em, totalsEl),
            },
            em
          )
        );
      });
      reactRow.append(totalsEl);

      const commentsWrap = h("div", { style: "margin-top:10px" });
      const commentInput = h("input", { placeholder: "Add a comment…" });
      const commentBtn = h(
        "button",
        {
          class: "pill",
          onclick: () => sendComment(it.id, commentInput),
        },
        "Comment"
      );
      const commentsList = h("div", {
        id: "c-" + it.id,
        style: "margin-top:8px",
      });
      commentsWrap.append(
        h("div", { class: "row-wrap" }, commentInput, commentBtn),
        commentsList
      );

      li.append(header, body, reactRow, commentsWrap);
      ul.append(li);

      updateReactions(it.id, totalsEl);
      loadComments(it.id, commentsList);
    });
    listBody.innerHTML = "";
    if (viewingPen) {
      listBody.append(
        h(
          "div",
          { class: "row-wrap", style: "margin-bottom:8px" },
          h("span", { class: "muted" }, "Viewing " + viewingPen + " — "),
          h(
            "button",
            {
              class: "pill",
              onclick: () => {
                viewingPen = null;
                load(true);
              },
            },
            COPY.feed.back
          )
        )
      );
    }
    listBody.append(ul);
  }
  async function toggleReact(storyId, emoji, totalsEl) {
    const pen = (localStorage.getItem(LAST_PEN_KEY) || "").trim();
    if (!pen) return alert("Set your Pen Name on Home");
    if (totalsEl) totalsEl.textContent = "Updating…";
    await dbReact(storyId, pen, emoji);
    await updateReactions(storyId, totalsEl);
  }
  async function updateReactions(storyId, target) {
    const { totals } = await dbReactionTotals(storyId);
    const s = COPY.feed.reactionsLabel(totals);
    if (target) target.textContent = s;
  }
  async function sendComment(storyId, inputEl) {
    const pen = (localStorage.getItem(LAST_PEN_KEY) || "").trim();
    if (!pen) return alert("Set your Pen Name on Home");
    const txt = inputEl.value.trim();
    if (!txt) return;
    inputEl.disabled = true;
    const { error } = await dbInsertComment(storyId, pen, txt);
    if (!error) {
      inputEl.value = "";
      loadComments(storyId, document.getElementById("c-" + storyId));
    }
    inputEl.disabled = false;
  }
  async function loadComments(storyId, target) {
    const { data, error } = await dbFetchComments(storyId);
    if (error) {
      target.textContent = "Could not load comments.";
      return;
    }
    target.innerHTML = (data || [])
      .map(
        (c) =>
          `<div style="margin:6px 0"><b style="color:#c7d2fe">${esc(
            c.pen
          )}</b>: ${esc(c.text)} <small class="muted">(${new Date(
            c.created_at
          ).toLocaleString()})</small></div>`
      )
      .join("");
  }

  wrapper.append(composeCard, h("div", { style: "height:14px" }), feedCard);
  load(true);
  return wrapper;
}

function Gallery() {
  const wrap = h("div", {}),
    grid = h("div", { class: "gallery-grid" }),
    sentinel = h("div", { class: "gallery-sentinel" });
  const sumInput = h("input", {
    placeholder: COPY.gallery.sumPH,
    maxlength: "200",
  });
  const file = h("input", { type: "file", accept: "image/*,video/*" });
  const uploadBtn = h(
    "button",
    { class: "pill", onclick: doUpload },
    COPY.gallery.uploadBtn
  );
  const tip = h(
    "div",
    { class: "muted", style: "font-size:12px;margin-top:6px" },
    COPY.gallery.tip
  );

  let offset = 0,
    PAGE = 18,
    reachedEnd = false,
    loading = false;

  const uploader = Card(
    "Post to Gallery",
    "Your pen/mask & timestamp will be shown",
    h(
      "div",
      {},
      h("div", { class: "grid", style: "grid-template-columns:1fr" }, sumInput),
      h("div", { class: "row-wrap", style: "margin-top:8px" }, file, uploadBtn),
      tip
    )
  );

  const listCard = Card(COPY.gallery.title, COPY.gallery.subtitle, grid);

  async function doUpload() {
    const pen = (localStorage.getItem(LAST_PEN_KEY) || "").trim();
    const mask = localStorage.getItem(LAST_MASK_KEY) || "Grey";
    if (!pen) {
      alert("Set your pen name on Home first.");
      return;
    }
    if (!file.files || !file.files[0]) {
      alert("Choose a file");
      return;
    }
    const f = file.files[0];
    const ext = (f.name.split(".").pop() || "bin").toLowerCase();
    const path = `${pen}/${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;
    const up = await supabase.storage.from("gallery").upload(path, f, {
      upsert: false,
      contentType: f.type || undefined,
    });
    if (up.error) {
      alert("Upload failed: " + up.error.message);
      return;
    }
    const { data: pub } = supabase.storage.from("gallery").getPublicUrl(path);
    const { error } = await dbInsertGallery({
      pen,
      mask,
      summary: sumInput.value.trim() || null,
      url: pub.publicUrl,
      mime: f.type || null,
    });
    if (error) {
      alert("DB insert failed: " + error.message);
      return;
    }
    sumInput.value = "";
    file.value = "";
    offset = 0;
    reachedEnd = false;
    grid.innerHTML = "";
    loadMore(true);
  }

  async function loadMore(first = false) {
    if (loading || reachedEnd) return;
    loading = true;
    const { data, error } = await dbFetchGallery({ offset, limit: PAGE });
    if (error) {
      grid.innerHTML = setupCardHTML();
      return;
    }
    const rows = data || [];
    if (rows.length < PAGE) reachedEnd = true;
    offset += rows.length;
    rows.forEach((r) => grid.append(renderFrame(r)));
    if (first) observer.observe(sentinel);
    loading = false;
  }

  function renderFrame(row) {
    let media;
    const mt = String(row.mime || "").toLowerCase();
    if (mt.startsWith("video") || /\.(mp4|webm|mov|m4v)$/i.test(row.url)) {
      media = h("video", {
        src: row.url,
        controls: true,
        playsinline: true,
      });
    } else if (
      mt.startsWith("image") ||
      /\.(png|jpg|jpeg|gif|webp|avif)$/i.test(row.url)
    ) {
      media = h("img", {
        src: row.url,
        loading: "lazy",
        alt: row.summary || "",
      });
    } else {
      media = h(
        "div",
        {
          class: "muted",
          style:
            "height:260px;display:grid;place-items:center;border:1px dashed rgba(255,255,255,.2);border-radius:12px",
        },
        "Preview not supported — ",
        h("a", { href: row.url, style: "color:#c7d2fe" }, "open")
      );
    }
    const who = h(
      "div",
      { class: "who" },
      maskSVG(row.mask || "Grey", 16),
      esc(row.pen)
    );
    const meta = h(
      "div",
      { class: "meta" },
      who,
      h("time", { class: "muted" }, new Date(row.created_at).toLocaleString()),
      h("div", { class: "sum" }, esc(row.summary || ""))
    );
    return h("div", { class: "frame" }, media, meta);
  }

  function setupCardHTML() {
    const sql = `
-- Create tables used by Gallery + Tracks
create table if not exists public.gallery_posts(
id uuid primary key default gen_random_uuid(),
pen text not null,
mask text not null,
summary text,
url text not null,
mime text,
created_at timestamptz default now()
);
create table if not exists public.tracks(
id uuid primary key default gen_random_uuid(),
pen text not null,
mask text not null,
path text not null,
created_at timestamptz default now()
);
-- Recommended: create public storage buckets named 'gallery' and 'tracks'
-- Storage > Create bucket > Name: gallery (Public)
-- Storage > Create bucket > Name: tracks (Public)
`;
    const box = h(
      "div",
      {},
      h(
        "div",
        { class: "muted", style: "margin-bottom:8px" },
        "First-time setup: run this SQL once and create two public storage buckets (“gallery”, “tracks”)."
      ),
      h(
        "button",
        {
          class: "pill",
          onclick: () =>
            navigator.clipboard.writeText(sql).then(() => alert("SQL copied!")),
        },
        "Copy SQL"
      )
    );
    grid.innerHTML = "";
    grid.append(box);
    return "";
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) loadMore();
    },
    { rootMargin: "800px" }
  );

  wrap.append(uploader, h("div", { style: "height:14px" }), listCard, sentinel);
  loadMore(true);
  return wrap;
}

function Fun() {
  const eyesWrap = h("div", { class: "eyeShell" }),
    eyes = h("div", { class: "eyes" });
  function makeEye() {
    const eye = h("div", { class: "eye" }),
      pupil = h("div", { class: "pupil" });
    eye.append(pupil);
    return { eye, pupil };
  }
  const e1 = makeEye(),
    e2 = makeEye();
  eyes.append(e1.eye, e2.eye);
  eyesWrap.append(eyes);
  let centers = [];
  function measure() {
    centers = [e1.eye, e2.eye].map((el) => {
      const r = el.getBoundingClientRect();
      return {
        x: r.left + r.width / 2 + scrollX,
        y: r.top + r.height / 2 + scrollY,
      };
    });
  }
  addEventListener("resize", measure);
  setTimeout(measure, 60);
  function moveEyes(x, y) {
    if (centers.length < 2) measure();
    [e1, e2].forEach((E, i) => {
      const c = centers[i];
      const dx = x - c.x,
        dy = y - c.y,
        ang = Math.atan2(dy, dx),
        max = 10;
      E.pupil.style.transform = `translate(calc(-50% + ${
        Math.cos(ang) * max
      }px), calc(-50% + ${Math.sin(ang) * max}px))`;
    });
  }
  addEventListener("mousemove", (e) => moveEyes(e.pageX, e.pageY), {
    passive: true,
  });
  addEventListener(
    "touchmove",
    (e) => {
      const t = e.touches[0];
      if (t) moveEyes(t.pageX, t.pageY);
    },
    { passive: true }
  );

  let trailOn = false;
  function spawnParticle(x, y) {
    const p = document.createElement("div");
    p.className = "particle";
    const ang = Math.random() * Math.PI * 2,
      dist = 6 + Math.random() * 10;
    p.style.setProperty("--x", `${Math.cos(ang) * dist}px`);
    p.style.setProperty("--y", `${Math.sin(ang) * dist}px`);
    p.style.left = x - 4 + "px";
    p.style.top = y - 4 + "px";
    const color = `hsla(${Math.floor(200 + Math.random() * 80)} 95% 65% / 1)`;
    p.style.background = color;
    p.style.boxShadow = `0 0 10px ${color}, 0 0 30px ${color}`;
    p.style.animation = "pop 600ms ease-out forwards";
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 620);
  }
  function enableTrail() {
    if (trailOn) return;
    trailOn = true;
    addEventListener("mousemove", trailMove, { passive: true });
    addEventListener("touchmove", trailTouch, { passive: true });
  }
  function disableTrail() {
    trailOn = false;
    removeEventListener("mousemove", trailMove);
    removeEventListener("touchmove", trailTouch);
  }
  function trailMove(e) {
    spawnParticle(e.pageX, e.pageY);
  }
  function trailTouch(e) {
    const t = e.touches[0];
    if (t) trailMove({ pageX: t.pageX, pageY: t.pageY });
  }
  const trailBtn = h(
    "button",
    {
      class: "pill",
      onclick: () => {
        if (trailOn) {
          disableTrail();
          trailBtn.textContent = "Enable trail";
        } else {
          enableTrail();
          trailBtn.textContent = "Disable trail";
        }
      },
    },
    "Enable trail"
  );

  const QUOTES = {
    jokes: [
      "I told my computer I needed a break—it said it was going to sleep anyway.",
      "There are 10 types of people: those who understand binary and those who don’t.",
      "My code doesn’t have bugs; it just develops random features.",
    ],
    scifi: [
      "“Do. Or do not. There is no try.” — Yoda",
      "“I’m sorry, Dave. I’m afraid I can’t do that.” — HAL 9000",
      "“The cosmos is within us. We are made of star-stuff.” — Carl Sagan",
    ],
    fortune: [
      "A new idea will transport you to unexpected places.",
      "Your curiosity will open a door you didn’t know existed.",
      "Good news will arrive from a great distance.",
    ],
    philosophy: [
      "“The unexamined life is not worth living.” — Socrates",
      "“We are what we repeatedly do.” — Aristotle",
      "“Man is condemned to be free.” — Sartre",
    ],
  };
  const select = h(
    "select",
    {},
    ...["jokes", "scifi", "fortune", "philosophy", "surprise"].map((k) =>
      h("option", { value: k }, k)
    )
  );
  const out = h(
    "div",
    {
      class: "card",
      style: "margin-top:10px;padding:12px;font-size:15px",
    },
    "Click “Generate”."
  );
  const gen = h(
    "button",
    {
      class: "pill",
      onclick: () => {
        const cat = select.value;
        const pool =
          cat === "surprise"
            ? [
                ...QUOTES.jokes,
                ...QUOTES.scifi,
                ...QUOTES.fortune,
                ...QUOTES.philosophy,
              ]
            : QUOTES[cat];
        out.textContent = choose(pool);
      },
    },
    "Generate"
  );

  const blob = h("div", {
    style:
      "width:160px;height:160px;border-radius:50%;background:radial-gradient(circle at 40% 35%,rgba(255,255,255,.5),rgba(99,102,241,.6) 35%,rgba(2,6,23,.9) 70%);border:1px solid rgba(255,255,255,.25);box-shadow:inset 0 20px 60px rgba(0,0,0,.45), 0 10px 50px rgba(99,102,241,.35)",
  });
  const colorSel = h(
    "select",
    {},
    ...["indigo", "pink", "green", "cyan"].map((c) =>
      h("option", { value: c }, c)
    )
  );
  const sizeSel = h("input", {
    type: "range",
    min: "120",
    max: "220",
    value: "160",
  });
  function setBlobColor(v) {
    const m =
      {
        indigo: "rgba(99,102,241,.6)",
        pink: "rgba(236,72,153,.6)",
        green: "rgba(34,197,94,.6)",
        cyan: "rgba(34,211,238,.6)",
      }[v] || "rgba(99,102,241,.6)";
    blob.style.background = `radial-gradient(circle at 40% 35%,rgba(255,255,255,.5),${m} 35%,rgba(2,6,23,.9) 70%)`;
    blob.style.boxShadow = `inset 0 20px 60px rgba(0,0,0,.45), 0 10px 50px ${m}`;
  }
  colorSel.oninput = (e) => setBlobColor(e.target.value);
  sizeSel.oninput = (e) => {
    blob.style.width = blob.style.height = e.target.value + "px";
  };
  setBlobColor("indigo");

  const diceOut = h(
    "div",
    {
      class: "card",
      style:
        "margin-top:10px;padding:12px;font-size:22px;font-weight:700;text-align:center",
    },
    "—"
  );
  const diceBtn = h(
    "button",
    {
      class: "pill",
      onclick: () => {
        diceOut.textContent = String(1 + Math.floor(Math.random() * 6));
      },
    },
    "Roll d6"
  );

  return h(
    "div",
    {},
    Card(COPY.fun.eyesTitle, COPY.fun.eyesSubtitle, eyesWrap),
    h("div", { style: "height:14px" }),
    Card(COPY.fun.trailTitle, COPY.fun.trailSubtitle, h("div", {}, trailBtn)),
    h("div", { style: "height:14px" }),
    Card(
      COPY.fun.quotesTitle,
      COPY.fun.quotesSubtitle,
      h(
        "div",
        {},
        h("div", {}, select),
        h("div", { style: "margin-top:10px" }, gen),
        out
      )
    ),
    h("div", { style: "height:14px" }),
    Card(
      COPY.fun.blobTitle,
      COPY.fun.blobSubtitle,
      h(
        "div",
        { style: "display:grid;place-items:center;gap:12px" },
        blob,
        h(
          "div",
          { class: "row-wrap" },
          h("label", {}, COPY.fun.blobColor, " ", colorSel),
          h("label", {}, COPY.fun.blobSize, " ", sizeSel)
        )
      )
    ),
    h("div", { style: "height:14px" }),
    Card(
      COPY.fun.diceTitle,
      COPY.fun.diceSubtitle,
      h("div", {}, diceBtn, diceOut)
    )
  );
}

// ====== Router ======
function route() {
  if (!location.hash) location.hash = "#home";
  const app = document.getElementById("app");
  app.innerHTML = "";
  const hash = location.hash;
  if (hash.startsWith("#stories")) app.append(Stories());
  else if (hash.startsWith("#gallery")) app.append(Gallery());
  else if (hash.startsWith("#fun")) app.append(Fun());
  else app.append(Home());
  setActiveNav();
  updateIdentityBadge();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", route);
route();

// ====== Jukebox logic ======
const demoTracks = [
  {
    pen: "PRISM",
    mask: "Space Wizard",
    path: "https://cdn.pixabay.com/download/audio/2022/02/23/audio_4d8dd6d2b2.mp3?filename=stargazer-189356.mp3",
  },
  {
    pen: "PRISM",
    mask: "Retro Martian",
    path: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_1f105c0be5.mp3?filename=space-ambient-110241.mp3",
  },
];
(async function initJukebox() {
  const audio = document.getElementById("jbAudio");
  const play = document.getElementById("jbPlay");
  const prev = document.getElementById("jbPrev");
  const next = document.getElementById("jbNext");
  const scrub = document.getElementById("jbScrub");
  const time = document.getElementById("jbTime");
  const screen = document.getElementById("jbScreen").querySelector(".name");
  const maskIcon = document.getElementById("jbMaskIcon");
  const file = document.getElementById("jbFile");

  let list = [];
  const { data, error } = await dbFetchTracks();
  if (!error && data && data.length) list = data;
  else list = demoTracks;

  let i = 0;
  function setScreen(pen, mask) {
    maskIcon.innerHTML = "";
    maskIcon.append(maskSVG(mask || "Grey", 16));
    screen.textContent = `${pen} (${mask})`;
  }
  function load(k) {
    i = (k + list.length) % list.length;
    const item = list[i];
    let url = item.path;
    if (!/^https?:/.test(url)) {
      const { data } = supabase.storage.from("tracks").getPublicUrl(url);
      url = data.publicUrl;
    }
    audio.src = url;
    setScreen(item.pen || "Unknown", item.mask || "Grey");
    audio.play().catch(() => {});
    play.innerHTML = '<span class="jb-glyph">⏸</span>';
  }
  function fmt(s) {
    s = Math.max(0, Math.floor(s || 0));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  play.onclick = () => {
    if (audio.paused) {
      audio.play();
      play.innerHTML = '<span class="jb-glyph">⏸</span>';
    } else {
      audio.pause();
      play.innerHTML = '<span class="jb-glyph">▶</span>';
    }
  };
  prev.onclick = () => load(i - 1);
  next.onclick = () => load(i + 1);
  audio.addEventListener("loadedmetadata", () => {
    scrub.max = Math.floor(audio.duration || 0);
    time.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
  });
  audio.addEventListener("timeupdate", () => {
    scrub.value = Math.floor(audio.currentTime || 0);
    time.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
  });
  scrub.oninput = () => (audio.currentTime = Number(scrub.value || 0));
  audio.addEventListener("ended", () => load(i + 1));

  // Upload new track
  file.addEventListener("change", async () => {
    const f = file.files[0];
    if (!f) return;
    const pen = (localStorage.getItem(LAST_PEN_KEY) || "").trim() || "Guest";
    const mask = localStorage.getItem(LAST_MASK_KEY) || "Grey";
    const ext = (f.name.split(".").pop() || "mp3").toLowerCase();
    const path = `${pen}/${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;
    const up = await supabase.storage.from("tracks").upload(path, f, {
      upsert: false,
      contentType: f.type || undefined,
    });
    if (up.error) {
      alert("Track upload failed: " + up.error.message);
      return;
    }
    const { error } = await dbInsertTrack({ pen, mask, path });
    if (error) {
      alert("DB insert failed: " + error.message);
      return;
    }
    list.push({ pen, mask, path });
    load(list.length - 1);
    file.value = "";
  });

  // initial label
  setScreen("PRISM FM", "Space Wizard");
})();
