// ====== CONFIG ======
const yearElement = document.getElementById("year");
if (yearElement) yearElement.textContent = new Date().getFullYear();
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
    subtitle: "Use a password to lock your pen. You can sign back in anytime.",
    penPlaceholder: "Pen name",
    pwPlaceholder: "Password (optional to reserve pen)",
    saveBtn: "Save",
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
    trailIntensity: "Intensity",
    trailMemory: "Memory",
    quotesTitle: "Random Quote",
    quotesSubtitle: "Jokes, sci-fi, fortunes, philosophy",
    quotesButton: "Generate",
    quotesCopy: "Copy",
    blobTitle: "Pet Blob",
    blobSubtitle: "Customize color & size",
    blobColor: "Color:",
    blobSize: "Size:",
    diceTitle: "Dice",
    diceSubtitle: "Roll a d6 or d20",
    constellationsTitle: "Constellation Drawer",
    constellationsSubtitle: "Sketch stars; lines fade like cosmic trails",
    synthTitle: "Ambient Synth Pad",
    synthSubtitle: "Tap neon pads to weave a spacey chord",
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
const LAST_ID_KEY = "prism_last_id";
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

// ====== Identity Manager ======
class IdentityManager {
  constructor() {
    this.id = localStorage.getItem(LAST_ID_KEY) || "";
    this.pen = localStorage.getItem(LAST_PEN_KEY) || "";
    this.mask = localStorage.getItem(LAST_MASK_KEY) || "Grey";
    this.listeners = [];
  }

  update(id, pen, mask) {
    this.id = id;
    this.pen = pen;
    this.mask = mask;

    localStorage.setItem(LAST_ID_KEY, id);
    localStorage.setItem(LAST_PEN_KEY, pen);
    localStorage.setItem(LAST_MASK_KEY, mask);
    this.notifyListeners();
  }

  clear() {
    this.id = "";
    this.pen = "";
    this.mask = "Grey";
    localStorage.removeItem(LAST_ID_KEY);
    localStorage.removeItem(LAST_PEN_KEY);
    localStorage.setItem(LAST_MASK_KEY, this.mask);
    this.notifyListeners();
  }

  notifyListeners() {
    this.listeners.forEach((callback) => callback(this.pen, this.mask));
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }

  getId() {
    return this.id;
  }

  getPen() {
    return this.pen;
  }
  getMask() {
    return this.mask;
  }
}

const identity = new IdentityManager();
identity.subscribe(() => {
  try {
    renderIdentityBadge();
  } catch (e) {}
});

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

// ====== Identity Dropdown ======
function createMaskSelector(currentMask, onChange) {
  const selector = h("select", {
    value: currentMask,
    onchange: (e) => onChange(e.target.value),
    style:
      "background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.3);color:#c7d2fe;padding:4px 8px;border-radius:6px;font-size:12px;",
  });

  // Group masks by category for better UX
  const categories = {
    Classic: ["Grey", "Nordic", "Reptilian"],
    Alien: [
      "Insectoid",
      "Cyborg Alien",
      "Retro Martian",
      "Roswell Cartoon",
      "Xeno-Beast",
    ],
    Mystical: ["Space Wizard", "Cosmic Jellyfish", "Nebula Face"],
    Dark: ["Crystal Skull", "Void Wraith", "Solar Phantom", "Obsidian Fox"],
  };

  Object.entries(categories).forEach(([category, masks]) => {
    const optgroup = h("optgroup", { label: category });
    masks.forEach((mask) => {
      optgroup.append(h("option", { value: mask }, mask));
    });
    selector.append(optgroup);
  });

  setTimeout(() => {
    const desired = currentMask || identity.getMask();
    if (
      Array.from(selector.querySelectorAll("option")).some(
        (o) => o.value === desired
      )
    ) {
      selector.value = desired;
    }
  }, 0);

  return selector;
}

function createIdentityDropdown() {
  const container = h("div", { class: "identity-dropdown-container" });
  const dropdown = h("div", {
    class: "identity-dropdown",
    style: "display:none;",
  });

  const trigger = h("button", {
    class: "identity-trigger",
    onclick: () => {
      dropdown.style.display =
        dropdown.style.display === "none" ? "block" : "none";
    },
  });

  function updateTrigger() {
    const pen = identity.getPen() || "Guest";
    const mask = identity.getMask();
    trigger.innerHTML = "";
    trigger.append(
      maskSVG(mask, 18),
      h("span", { style: "margin:0 6px" }, pen),
      h("span", { class: "muted", style: "font-size:12px" }, `(${mask})`),
      h("span", { style: "margin-left:6px;font-size:10px" }, "▼")
    );
  }

  // Quick mask switcher
  const quickMaskSelector = createMaskSelector(
    identity.getMask(),
    (newMask) => {
      identity.update(identity.getId(), identity.getPen(), newMask);
      updateTrigger();
      renderIdentityBadge();
    }
  );

  // Quick pen edit
  const quickPenInput = h("input", {
    placeholder: "Pen name",
    value: identity.getPen(),
    style:
      "background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.3);color:#c7d2fe;padding:4px 8px;border-radius:6px;font-size:12px;margin-right:6px;",
    onchange: (e) => {
      identity.update(
        identity.getId(),
        e.target.value.trim(),
        identity.getMask()
      );
      updateTrigger();
      updateIdentityBadge();
    },
  });

  const saveBtn = h(
    "button",
    {
      class: "pill",
      style: "padding:6px 14px;font-size:12px;",
      onclick: async () => {
        const userId = identity.getId();
        const pen = identity.getPen();
        const mask = identity.getMask();
        if (!pen) return alert("Pen name required");
        try {
          const { data, error } = await dbUpsertUser({ id: userId, pen, mask });
          if (error) return alert("Could not update: " + error.message);
          const user = data[0];
          identity.update(user.id, user.pen, user.mask);
          alert("Identity saved ✅");
        } catch (e) {
          alert("Failed to save: " + e.message);
        }
      },
    },
    "Save"
  );

  dropdown.append(
    h(
      "div",
      { style: "padding:8px;border-bottom:1px solid rgba(99,102,241,.2)" },
      h(
        "div",
        { style: "margin-bottom:6px;font-size:12px;color:#c7d2fe" },
        "Quick Edit:"
      ),
      h(
        "div",
        { style: "display:flex;gap:6px;align-items:center" },
        quickPenInput,
        quickMaskSelector
      )
    ),
    h(
      "div",
      {
        style:
          "padding:8px;border-top:1px solid rgba(99,102,241,.2);display:flex;gap:6px;align-items:center",
      },
      h(
        "button",
        {
          class: "pill",
          style: "padding:6px 14px",
          onclick: () => {
            identity.clear();
            updateTrigger();
            updateIdentityBadge();
            dropdown.style.display = "none";
          },
        },
        "Clear identity"
      ),
      saveBtn
    ),
    h(
      "div",
      { style: "padding:8px" },
      h(
        "a",
        {
          href: "#home",
          style: "color:#a5b4fc;font-size:12px;text-decoration:none",
          onclick: () => (dropdown.style.display = "none"),
        },
        "Full Setup →"
      )
    )
  );

  updateTrigger();

  container.append(trigger, dropdown);
  return container;
}

function renderIdentityBadge() {
  const el = document.getElementById("identityBadge");
  if (!el) return;
  const pen = identity.getPen() || "Guest";
  const mask = identity.getMask();
  const isHome = (location.hash || "#home").startsWith("#home");
  el.innerHTML = "";
  el.className = `id-badge ${pen === "Guest" ? "guest" : "registered"}`;

  if (isHome) {
    const btn = h("button", {
      class: "identity-trigger",
      title: "Identity (set up on Home)",
      onclick: () => (location.hash = "#home"),
    });
    btn.append(
      maskSVG(mask, 18),
      h("span", { style: "margin:0 6px" }, pen || "Guest"),
      h("span", { class: "muted", style: "font-size:12px" }, `(${mask})`)
    );
    el.append(btn);
  } else {
    const dropdown = createIdentityDropdown();
    el.appendChild(dropdown);
  }
}

// Back-compat alias
const updateIdentityBadge = renderIdentityBadge;

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
    .select("pen, mask, password_hash")
    .eq("pen", pen)
    .maybeSingle();
}

async function dbFetchUserByPen(pen) {
  return await supabase
    .from("users")
    .select("id, pen, mask, password_hash")
    .eq("pen", pen)
    .maybeSingle();
}

async function dbFetchUserById(id) {
  return await supabase
    .from("users")
    .select("id, pen, mask, password_hash")
    .eq("id", id)
    .maybeSingle();
}

async function dbUpsertUser(user) {
  return await supabase
    .from("users")
    .upsert([user], { onConflict: "id" })
    .select();
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
  // Identity on Home
  const penInput = h("input", {
    placeholder: COPY.identity.penPlaceholder,
    maxlength: "40",
    value: identity.getPen(),
  });
  const pw = h("input", {
    type: "password",
    placeholder: COPY.identity.pwPlaceholder,
  });

  const suggestBtn = h(
    "button",
    {
      class: "pill",
      onclick: () => {
        const animals = [
          "Nebula",
          "Quasar",
          "Photon",
          "Comet",
          "Meteor",
          "Aurora",
          "Zenith",
          "Orbit",
          "Nova",
          "Eclipse",
        ];
        const nouns = [
          "Scribe",
          "Seeker",
          "Wanderer",
          "Voyager",
          "Echo",
          "Specter",
          "Weaver",
          "Drifter",
          "Cipher",
          "Lumen",
        ];
        const suffix = Math.random().toString(36).slice(2, 5);
        penInput.value = `${choose(animals)}${choose(nouns)}_${suffix}`;
      },
    },
    "Suggest"
  );

  const clearBtn = h(
    "button",
    {
      class: "pill",
      onclick: () => {
        identity.clear();
        penInput.value = "";
        pw.value = "";
        currentMask = identity.getMask();
        renderPreview();
        renderMaskGrid();
        renderIdentityBadge();
        updateButtons();
      },
    },
    "Clear identity"
  );

  let currentMask = identity.getMask();
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

  function updateButtons() {
    const signedIn = !!(identity.getPen() || "").trim();
    suggestBtn.style.display = signedIn ? "none" : "inline-flex";
    clearBtn.style.display = signedIn ? "inline-flex" : "none";
  }
  updateButtons();

  async function reserve() {
    const p = penInput.value.trim();
    if (!p) return alert("Enter a pen name");

    const currentPen = (identity.getPen() || "").trim();
    const signedIn = !!currentPen;
    const password = pw.value.trim() || null;

    // hash password if provided
    const enc = (s) =>
      crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)).then((b) =>
        Array.from(new Uint8Array(b))
          .map((x) => x.toString(16).padStart(2, "0"))
          .join("")
      );
    const password_hash = password ? await enc(password) : null;

    const { data: foundUser, error: fetchErr } = await dbFetchUserByPen(p);

    // Signed-in updates
    if (signedIn) {
      const userId = identity.getId();
      if (p !== currentPen) {
        if (fetchErr) return alert("Could not check pen availability.");
        if (foundUser && foundUser.password_hash)
          return alert("That pen is reserved.");

        // fetch current user to keep existing hash
        const { data: curData } = await dbFetchUserById(userId);
        const keepHash = (curData && curData.password_hash) || null;

        const { error } = await dbUpsertUser({
          id: userId,
          pen: p,
          mask: currentMask,
          password_hash: keepHash,
        });
        if (error) return alert("Could not update pen: " + error.message);

        identity.update(userId, p, currentMask);
        renderIdentityBadge();
        updateButtons();
        return alert("Pen updated ✅");
      } else {
        // same pen, just update mask/hash
        const keepHash = (foundUser && foundUser.password_hash) || null;
        const { error } = await dbUpsertUser({
          id: userId,
          pen: p,
          mask: currentMask,
          password_hash: keepHash,
        });
        if (error) return alert("Could not save: " + error.message);

        identity.update(userId, p, currentMask);
        renderIdentityBadge();
        updateButtons();
        return alert("Saved ✅");
      }
    }

    //  Not signed in
    if (fetchErr) return alert("Error fetching user: " + fetchErr.message);

    if (!foundUser) {
      // New account
      const { data, error } = await dbUpsertUser({
        pen: p,
        mask: currentMask,
        password_hash,
      });
      if (error) return alert("Could not create: " + error.message);

      const user = data[0];
      identity.update(user.id, user.pen, user.mask);
      renderIdentityBadge();
      updateButtons();
      return alert(password_hash ? "Created & signed in 🔒" : "Created");
    }

    // Existing user
    if (foundUser.password_hash) {
      // Locked account
      if (!password_hash)
        return alert("This pen is locked. Enter password to sign in.");
      if (password_hash !== foundUser.password_hash)
        return alert("Incorrect password for this pen.");

      // login success
      currentMask = foundUser.mask || currentMask;
      identity.update(foundUser.id, foundUser.pen, currentMask);
      renderPreview();
      renderMaskGrid();
      renderIdentityBadge();
      updateButtons();
      return alert("Signed in ✅");
    } else {
      // Unlocked account
      const nextMask = foundUser.mask || currentMask;
      const nextHash = foundUser.password_hash || password_hash || null;

      if (nextHash && nextHash !== foundUser.password_hash) {
        await dbUpsertUser({
          id: foundUser.id,
          pen: foundUser.pen,
          mask: nextMask,
          password_hash: nextHash,
        });
      }

      currentMask = nextMask;
      identity.update(foundUser.id, foundUser.pen, currentMask);
      renderPreview();
      renderMaskGrid();
      renderIdentityBadge();
      updateButtons();
      return alert(
        nextHash && nextHash !== foundUser.password_hash
          ? "Locked ✅"
          : "Signed in ✅"
      );
    }
  }

  (async () => {
    const existingPen = penInput.value.trim();
    if (existingPen) {
      const { data } = await dbFetchUserByPen(existingPen);
      if (data) {
        currentMask = identity.getMask() || data.mask || "Grey";
        identity.update(data.id, data.pen, currentMask);
        renderPreview();
        renderIdentityBadge();
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
        h("button", { class: "pill", onclick: reserve }, COPY.identity.saveBtn),
        suggestBtn,
        clearBtn
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

  return h(
    "div",
    {},
    identityCard,
    h("div", { style: "height:12px" }),
    cockpit,
    h("div", { style: "height:12px" })
  );
}

function Stories() {
  const wrapper = h("div", {});
  let items = [];
  let viewingPen = null;
  const pen = identity.getPen() || "";
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
      identity.getPen().trim() &&
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
    const p = identity.getPen().trim(),
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
    const pen = identity.getPen().trim();
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
    const pen = identity.getPen().trim();
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
    const pen = identity.getPen().trim();
    const mask = identity.getMask();
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
  let trailIntensity = 3;
  let trailMemoryMs = 600;
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
    p.style.animation = `pop ${trailMemoryMs}ms ease-out forwards`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), trailMemoryMs + 20);
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
    for (let i = 0; i < trailIntensity; i++) spawnParticle(e.pageX, e.pageY);
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
          trailBtn.textContent = COPY.fun.trailEnable;
        } else {
          enableTrail();
          trailBtn.textContent = COPY.fun.trailDisable;
        }
      },
    },
    COPY.fun.trailEnable
  );

  const intensityLabel = h(
    "label",
    { class: "muted" },
    COPY.fun.trailIntensity
  );
  const intensity = h("input", {
    type: "range",
    min: "1",
    max: "5",
    value: String(trailIntensity),
  });
  intensity.oninput = (e) => (trailIntensity = Number(e.target.value || 3));
  const memoryLabel = h("label", { class: "muted" }, COPY.fun.trailMemory);
  const memory = h("input", {
    type: "range",
    min: "300",
    max: "1400",
    value: String(trailMemoryMs),
  });
  memory.oninput = (e) => (trailMemoryMs = Number(e.target.value || 600));

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
  const copyQ = h(
    "button",
    {
      class: "pill",
      onclick: async () => {
        try {
          await navigator.clipboard.writeText(out.textContent || "");
          copyQ.textContent = "Copied!";
          setTimeout(() => (copyQ.textContent = COPY.fun.quotesCopy), 900);
        } catch (e) {}
      },
    },
    COPY.fun.quotesCopy
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
  const dieSel = h(
    "select",
    {},
    h("option", { value: "6" }, "d6"),
    h("option", { value: "20" }, "d20")
  );
  const diceBtn = h(
    "button",
    {
      class: "pill",
      onclick: () => {
        const faces = Number(dieSel.value || 6);
        diceOut.textContent = String(1 + Math.floor(Math.random() * faces));
      },
    },
    "Roll"
  );

  // Constellation Drawer
  const constWrap = h("div", { class: "constellation-wrap" });
  const constCanvas = h("canvas", { class: "constellation" });
  constWrap.append(constCanvas);
  let ctx, cw, ch;
  const stars = [];
  function resizeConst() {
    const r = constCanvas.getBoundingClientRect();
    const dpr = Math.min(2, devicePixelRatio || 1);
    cw = Math.floor(r.width);
    ch = 220;
    constCanvas.width = cw * dpr;
    constCanvas.height = ch * dpr;
    constCanvas.style.height = ch + "px";
    constCanvas.style.width = cw + "px";
    ctx = constCanvas.getContext("2d");
    ctx.scale(dpr, dpr);
  }
  function addStar(x, y) {
    stars.push({
      x,
      y,
      life: 1,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
    });
    if (stars.length > 200) stars.shift();
  }
  function drawConst() {
    if (!ctx) return;
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(0, 0, cw, ch);
    // draw lines between recent points
    ctx.lineWidth = 1;
    for (let i = 1; i < stars.length; i++) {
      const a = stars[i - 1],
        b = stars[i];
      const alpha = Math.max(0, b.life * 0.9);
      ctx.strokeStyle = `rgba(124,131,255,${alpha})`;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    // update/draw stars
    stars.forEach((s) => {
      s.x += s.vx;
      s.y += s.vy;
      s.life *= 0.985;
      ctx.fillStyle = `rgba(188,211,255,${s.life})`;
      ctx.shadowColor = "rgba(124,131,255,0.6)";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    requestAnimationFrame(drawConst);
  }
  constCanvas.addEventListener("pointermove", (e) => {
    const rect = constCanvas.getBoundingClientRect();
    addStar(e.clientX - rect.left, e.clientY - rect.top);
  });
  setTimeout(() => {
    resizeConst();
    drawConst();
  }, 0);
  addEventListener("resize", resizeConst);

  // Ambient Synth Pad
  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx)
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  function createTone(freq) {
    ensureAudio();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    osc.type = "sine";
    osc.frequency.value = freq;
    filter.type = "lowpass";
    filter.frequency.value = 2400;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.05);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.5);
    gain.gain.linearRampToValueAtTime(0.0, now + 2.4);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(now + 2.5);
  }
  const PAD_NOTES = {
    "A minor": [220.0, 261.63, 329.63],
    "F major": [174.61, 220.0, 261.63],
    "G major": [196.0, 246.94, 392.0 / 2],
    "C major": [130.81, 164.81, 261.63],
  };
  const padGrid = h("div", { class: "pad-grid" });
  Object.entries(PAD_NOTES).forEach(([label, freqs]) => {
    const pad = h(
      "button",
      {
        class: "pad",
        onmousedown: () => freqs.forEach(createTone),
        ontouchstart: (e) => {
          e.preventDefault();
          freqs.forEach(createTone);
        },
      },
      label
    );
    padGrid.append(pad);
  });

  return h(
    "div",
    {},
    Card(COPY.fun.eyesTitle, COPY.fun.eyesSubtitle, eyesWrap),
    h("div", { style: "height:14px" }),
    Card(
      COPY.fun.trailTitle,
      COPY.fun.trailSubtitle,
      h(
        "div",
        {},
        h("div", { class: "row-wrap" }, trailBtn),
        h(
          "div",
          { class: "row-wrap", style: "margin-top:8px" },
          h("div", { class: "row" }, intensityLabel, intensity),
          h("div", { class: "row" }, memoryLabel, memory)
        )
      )
    ),
    h("div", { style: "height:14px" }),
    Card(
      COPY.fun.quotesTitle,
      COPY.fun.quotesSubtitle,
      h(
        "div",
        {},
        h("div", {}, select),
        h(
          "div",
          { style: "margin-top:10px" },
          h("div", { class: "row" }, gen, copyQ)
        ),
        out
      )
    ),
    h("div", { style: "height:14px" }),
    Card(
      COPY.fun.constellationsTitle,
      COPY.fun.constellationsSubtitle,
      constWrap
    ),
    h("div", { style: "height:14px" }),
    Card(COPY.fun.synthTitle, COPY.fun.synthSubtitle, padGrid),
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
      h("div", {}, h("div", { class: "row" }, dieSel, diceBtn), diceOut)
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
  renderIdentityBadge();

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
  const panel = document.getElementById("jbPanel");
  const listEl = document.getElementById("jbList");
  const closeBtn = document.getElementById("jbClose");

  let list = [];
  const { data, error } = await dbFetchTracks();
  if (!error && Array.isArray(data)) list = data;

  let i = 0;
  function titleFromPath(p) {
    const file = labelFromPath(p);
    const base = file.replace(/\.[^.]+$/, "");
    return base.replace(/[\-_]+/g, " ");
  }
  function resolveTrackUrl(path) {
    if (/^https?:/.test(path)) return path;
    const { data } = supabase.storage.from("tracks").getPublicUrl(path);
    return data.publicUrl;
  }
  function setScreen(pen, mask, path) {
    maskIcon.innerHTML = "";
    maskIcon.append(maskSVG(mask || "Grey", 22));
    const name = path ? titleFromPath(path) : "";
    screen.textContent = name ? `${pen} — ${name}` : `${pen}`;
  }
  function load(k) {
    if (!list || !list.length) return;
    i = (k + list.length) % list.length;
    const item = list[i];
    let url = resolveTrackUrl(item.path);
    audio.src = url;
    setScreen(item.pen || "Unknown", item.mask || "Grey", item.path);
    audio.play().catch(() => {});
    play.innerHTML = '<span class="jb-glyph">⏸</span>';
    renderList();
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
    const files = file.files;
    if (!files || files.length === 0) return;

    for (const f of files) {
      const pen = identity.getPen().trim() || "Guest";
      const mask = identity.getMask();

      // Separate name & extension
      const dotIndex = f.name.lastIndexOf(".");
      const base = dotIndex > -1 ? f.name.slice(0, dotIndex) : f.name;
      const ext =
        dotIndex > -1 ? f.name.slice(dotIndex + 1).toLowerCase() : "mp3";

      const safeBase =
        base
          .toLowerCase()
          .normalize("NFKD")
          .replace(/[^a-z0-9\s-_]/g, "")
          .trim()
          .replace(/[\s_]+/g, "-")
          .slice(0, 40) || "track";

      // Build final path
      const rand = Math.random().toString(36).slice(2, 8);
      const path = `${pen}/${safeBase}__${Date.now()}_${rand}.${ext}`;

      // Upload
      const up = await supabase.storage.from("tracks").upload(path, f, {
        upsert: false,
        contentType: f.type || undefined,
      });

      if (up.error) {
        alert("Track upload failed: " + up.error.message);
        return;
      }

      // Insert into DB
      const { error } = await dbInsertTrack({ pen, mask, path });
      if (error) {
        alert("DB insert failed: " + error.message);
        return;
      }

      list.push({ pen, mask, path });
      load(list.length - 1);
    }

    file.value = "";
  });

  if (list.length) {
    const first = list[0];
    i = 0;
    audio.src = resolveTrackUrl(first.path);
    setScreen(first.pen || "Unknown", first.mask || "Grey", first.path);
  } else {
    maskIcon.innerHTML = "";
    screen.textContent = "No tracks — add one";
  }

  function labelFromPath(p) {
    const file =
      String(p || "")
        .split("/")
        .pop() || "";
    return file;
  }

  function renderList() {
    if (!listEl) return;
    listEl.innerHTML = "";
    if (!list || !list.length) {
      listEl.innerHTML =
        '<div class="muted" style="padding:12px">No tracks yet. Upload one to begin.</div>';
      return;
    }
    list.forEach((t, idx) => {
      const who = h(
        "div",
        { class: "who" },
        maskSVG(t.mask || "Grey", 14),
        esc(t.pen || "Unknown")
      );
      const path = h("div", { class: "path" }, esc(labelFromPath(t.path)));
      const row = h(
        "div",
        { class: "jb-item" + (idx === i ? " active" : "") },
        who,
        path
      );
      row.addEventListener("click", () => load(idx));
      listEl.append(row);
    });
  }

  // Toggle panel by tapping the screen area
  document.getElementById("jbScreen").addEventListener("click", () => {
    if (!panel) return;
    panel.hidden = !panel.hidden;
    if (!panel.hidden) renderList();
  });
  if (closeBtn) closeBtn.addEventListener("click", () => (panel.hidden = true));
})();
