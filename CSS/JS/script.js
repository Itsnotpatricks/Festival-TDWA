/* =====================================================
   MONET — script.js  (ONE file for the whole site)

   1. Theme (light / dark)
   2. Menu, cursor, visit page, experience page
   3. Monet page: gallery + timeline
   4. Works page: rooms + lightbox
   5. Shared background music

   Every page loads only this file:
   <script src="CSS/JS/script.js" defer></script>   (in the <head>)
   Each section checks that its page exists, so it is safe everywhere.
===================================================== */



/* ===================================================== 
   1. THEME: light / dark
===================================================== */

/* THEME: light / dark
   Load in <head> WITHOUT defer so the theme is applied before first paint. */
(function () {
    const KEY = "monet-theme";
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: light)");

    function saved() {
        try { return localStorage.getItem(KEY); } catch (e) { return null; }
    }
    function current() {
        return saved() || (media.matches ? "light" : "dark");
    }
    function apply(theme) {
        root.setAttribute("data-theme", theme);
        const btn = document.getElementById("themeToggle");
        if (btn) {
            btn.setAttribute("aria-pressed", theme === "light");
            btn.setAttribute("aria-label", theme === "light" ? "Switch to dark mode" : "Switch to light mode");
            btn.querySelector("span").textContent = theme === "light" ? "DARK" : "LIGHT";
        }
    }

    apply(current());

    document.addEventListener("DOMContentLoaded", () => {
        if (document.getElementById("themeToggle")) return;   // never create two buttons
        const btn = document.createElement("button");
        btn.type = "button";
        btn.id = "themeToggle";
        btn.className = "theme-toggle";
        btn.innerHTML = `<i></i><span></span>`;
        document.body.appendChild(btn);
        apply(current());

        btn.addEventListener("click", () => {
            const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
            try { localStorage.setItem(KEY, next); } catch (e) {}
            apply(next);
        });
    });

    media.addEventListener("change", () => { if (!saved()) apply(current()); });
})();


/* ===================================================== 
   2. MENU, CURSOR, VISIT PAGE, EXPERIENCE PAGE
===================================================== */

/* =====================================================
   MONET — script.js (shared by every page)
   Menu · cursor · visit page · experience page motion.
   Theme lives in theme.js, music in music.js.
===================================================== */

/* ---------- MENU ---------- */
const menuButton = document.getElementById("menuButton");
const menu = document.getElementById("menu");

if (menuButton && menu) {
    const lines = menuButton.querySelectorAll("span");

    function setLines(open) {
        lines[0].style.transform = open ? "rotate(45deg) translate(4px, 4px)" : "";
        lines[1].style.transform = open ? "rotate(-45deg) translate(4px, -4px)" : "";
    }

    menuButton.addEventListener("click", () => {
        setLines(menu.classList.toggle("active"));
    });

    document.querySelectorAll(".menu-links a").forEach(link => {
        link.addEventListener("click", () => {
            menu.classList.remove("active");
            setLines(false);
        });
    });
}


/* ---------- CURSOR + HOME LIGHT ---------- */
(function () {
    const cursor = document.querySelector(".cursor");
    const light = document.querySelector(".light");
    const background = document.querySelector(".background");

    document.addEventListener("mousemove", e => {
        if (cursor) {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
        }
        if (light) {
            light.style.left = `${e.clientX}px`;
            light.style.top = `${e.clientY}px`;
        }
        if (background) {
            const x = (window.innerWidth / 2 - e.clientX) / 80;
            const y = (window.innerHeight / 2 - e.clientY) / 80;
            background.style.transform = `scale(1.08) translate(${x}px, ${y}px)`;
        }
    });

    // grow on anything clickable (also works for elements created later)
    const hoverSelector = "a, button, input, textarea, select, .work, .shot";
    if (cursor) {
        document.addEventListener("mouseover", e => {
            if (e.target.closest(hoverSelector)) {
                cursor.style.width = "40px";
                cursor.style.height = "40px";
            }
        });
        document.addEventListener("mouseout", e => {
            if (e.target.closest(hoverSelector)) {
                cursor.style.width = "12px";
                cursor.style.height = "12px";
            }
        });
    }
})();


/* =====================================================
   VISIT PAGE ONLY
===================================================== */
(function () {

    const TICKETS = [
        { id: "standard", label: "STANDARD", price: 45, note: "" },
        { id: "student",  label: "STUDENT",  price: 35, note: "Valid ID required at entry" },
        { id: "child",    label: "UNDER 12", price: 0,  note: "Must be with a paying visitor" }
    ];

    const MAX_PER_TYPE = 10;
    const euro = n => `€${n}`;

    /* open in maps */
    const mapsLink = document.querySelector(".info-block .text-link");
    if (mapsLink) {
        const address = "Monet Immersive Experience, 12 Rue de l'Art, 75004 Paris, France";
        mapsLink.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(address);
        mapsLink.target = "_blank";
        mapsLink.rel = "noopener";
    }

    /* ticket modal */
    const buyButton = document.querySelector(".ticket-button");
    if (!buyButton) return;

    const quantities = { standard: 0, student: 0, child: 0 };

    const modal = document.createElement("div");
    modal.className = "ticket-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "ticketModalTitle");
    modal.hidden = true;

    modal.innerHTML = `
        <div class="ticket-modal-panel">
            <button type="button" class="modal-close" aria-label="Close">✕</button>

            <div id="ticketStep">
                <p class="modal-eyebrow">TICKETS</p>
                <h2 id="ticketModalTitle">Plan your <em>visit.</em></h2>

                <div class="modal-field">
                    <label for="visitDate">DATE</label>
                    <input type="date" id="visitDate">
                </div>

                <div class="modal-field">
                    <label for="visitTime">ENTRY TIME</label>
                    <select id="visitTime"></select>
                </div>

                <div class="modal-tickets">
                    ${TICKETS.map(t => `
                        <div class="modal-ticket">
                            <div>
                                <span>${t.label}</span>
                                <small>${t.note}</small>
                            </div>
                            <strong>${t.price ? euro(t.price) : "FREE"}</strong>
                            <div class="stepper">
                                <button type="button" data-id="${t.id}" data-step="-1" aria-label="Remove one ${t.label} ticket">−</button>
                                <output id="qty-${t.id}">0</output>
                                <button type="button" data-id="${t.id}" data-step="1" aria-label="Add one ${t.label} ticket">+</button>
                            </div>
                        </div>
                    `).join("")}
                </div>

                <p class="modal-error" id="ticketError" role="alert"></p>

                <div class="modal-total">
                    <span>TOTAL</span>
                    <strong id="ticketTotal">€0</strong>
                </div>

                <button type="button" class="send-button modal-confirm" id="ticketConfirm">CONFIRM ORDER ↗</button>
            </div>

            <div id="ticketDone" hidden>
                <p class="modal-eyebrow">CONFIRMED</p>
                <h2>See you <em>soon.</em></h2>
                <p class="modal-summary" id="ticketSummary"></p>
                <button type="button" class="send-button modal-confirm" id="ticketClose">CLOSE ↗</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const $ = id => modal.querySelector("#" + id);
    const dateInput  = $("visitDate");
    const timeSelect = $("visitTime");
    const errorEl    = $("ticketError");
    const totalEl    = $("ticketTotal");
    const stepEl     = $("ticketStep");
    const doneEl     = $("ticketDone");

    for (let h = 10; h <= 19; h++) {           // entry 10:00 to 19:00
        const o = document.createElement("option");
        o.value = o.textContent = `${String(h).padStart(2, "0")}:00`;
        timeSelect.appendChild(o);
    }

    const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    dateInput.min = dateInput.value = iso(new Date());

    const total = () => TICKETS.reduce((sum, t) => sum + t.price * quantities[t.id], 0);

    function render() {
        TICKETS.forEach(t => { $("qty-" + t.id).textContent = quantities[t.id]; });
        totalEl.textContent = euro(total());
    }

    let lastFocus = null;

    function openModal() {
        lastFocus = document.activeElement;
        stepEl.hidden = false;
        doneEl.hidden = true;
        errorEl.textContent = "";
        modal.hidden = false;
        document.body.style.overflow = "hidden";
        requestAnimationFrame(() => modal.classList.add("open"));
        modal.querySelector(".modal-close").focus();
    }

    function closeModal() {
        modal.classList.remove("open");
        document.body.style.overflow = "";
        setTimeout(() => { modal.hidden = true; }, 400);
        if (lastFocus) lastFocus.focus();
    }

    buyButton.addEventListener("click", e => { e.preventDefault(); openModal(); });

    modal.addEventListener("click", e => {
        if (e.target === modal) return closeModal();
        const step = e.target.closest("[data-step]");
        if (step) {
            const id = step.dataset.id;
            const next = quantities[id] + Number(step.dataset.step);
            quantities[id] = Math.min(MAX_PER_TYPE, Math.max(0, next));
            errorEl.textContent = "";
            render();
        }
    });

    modal.querySelector(".modal-close").addEventListener("click", closeModal);
    $("ticketClose").addEventListener("click", closeModal);

    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && !modal.hidden) closeModal();
    });

    $("ticketConfirm").addEventListener("click", () => {
        const count  = Object.values(quantities).reduce((a, b) => a + b, 0);
        const paying = quantities.standard + quantities.student;

        if (!dateInput.value) { errorEl.textContent = "Choose a date for your visit."; return; }
        if (count === 0)      { errorEl.textContent = "Add at least one ticket."; return; }
        if (paying === 0)     { errorEl.textContent = "Children under 12 must come with a standard or student ticket."; return; }

        /* PAYMENT GOES HERE */
        const order = { date: dateInput.value, time: timeSelect.value, tickets: { ...quantities }, total: total() };
        console.log("Order:", order);

        const lines = TICKETS
            .filter(t => quantities[t.id] > 0)
            .map(t => `${quantities[t.id]} × ${t.label.toLowerCase()}`)
            .join(", ");

        $("ticketSummary").textContent =
            `${lines} — ${dateInput.value} at ${timeSelect.value}. Total: ${euro(order.total)}.`;

        stepEl.hidden = true;
        doneEl.hidden = false;
        $("ticketClose").focus();
    });

    render();

    /* contact form */
    const form = document.querySelector(".contact-form");
    if (form) {
        const status = document.createElement("p");
        status.className = "form-status";
        status.setAttribute("role", "status");
        form.appendChild(status);

        form.addEventListener("submit", e => {
            e.preventDefault();

            const name    = form.name.value.trim();
            const email   = form.email.value.trim();
            const message = form.message.value.trim();

            status.classList.remove("ok");

            if (!name || !email || !message) { status.textContent = "Fill in your name, email and question."; return; }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { status.textContent = "Enter a valid email address."; return; }

            /* send to your backend or a form service here */
            console.log("Question:", { name, email, message });

            form.reset();
            status.classList.add("ok");
            status.textContent = "Thanks, we'll reply by email soon.";
        });
    }
})();


/* =====================================================
   EXPERIENCE PAGE — motion layer
===================================================== */
(function () {
    const page = document.querySelector(".experience-page");
    if (!page) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lerp = (a, b, t) => a + (b - a) * t;

    /* count-up */
    const counters = page.querySelectorAll("[data-count]");

    function countUp(el) {
        const end = Number(el.dataset.count);
        if (reduce) { el.textContent = end; return; }
        const start = performance.now(), dur = 1600;
        (function tick(now) {
            const p = Math.min(1, (now - start) / dur);
            el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
            if (p < 1) requestAnimationFrame(tick);
        })(start);
    }

    /* reveal chapters + .reveal blocks */
    const chapters = [...page.querySelectorAll(".chapter")];
    const reveals  = [...page.querySelectorAll(".reveal")];

    if ("IntersectionObserver" in window) {
        const cio = new IntersectionObserver(es => es.forEach(e => {
            if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); }
        }), { threshold: 0.6 });
        counters.forEach(c => cio.observe(c));

        const rio = new IntersectionObserver(es => es.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); }
        }), { threshold: 0.15 });
        chapters.concat(reveals).forEach(el => rio.observe(el));
    } else {
        counters.forEach(countUp);
        chapters.concat(reveals).forEach(el => el.classList.add("in"));
    }

    if (reduce) {
        chapters.concat(reveals).forEach(el => el.classList.add("in"));
        return;
    }

    /* room counter + tilt */
    const counter = page.querySelector(".room-counter");
    const counterNum = counter && counter.querySelector("b");

    const arts = chapters.map(ch => {
        const el = ch.querySelector(".chapter-art");
        const s = { el, rx: 0, ry: 0, trx: 0, try_: 0, py: 0 };
        if (!el) return s;
        el.addEventListener("mousemove", e => {
            const r = el.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width;
            const y = (e.clientY - r.top) / r.height;
            s.try_ = (x - 0.5) * 8;
            s.trx  = (0.5 - y) * 6;
            el.style.setProperty("--mx", x * 100 + "%");
            el.style.setProperty("--my", y * 100 + "%");
        });
        el.addEventListener("mouseleave", () => { s.trx = 0; s.try_ = 0; });
        return s;
    });

    /* marquee */
    const track = page.querySelector(".marquee .track");
    let mx = 0, trackW = track ? track.scrollWidth / 2 : 0;

    /* one animation loop */
    const bar = page.querySelector(".progress") || document.querySelector(".progress");
    let lastY = window.scrollY, vel = 0;

    function frame() {
        const y = window.scrollY;
        vel = lerp(vel, y - lastY, 0.12);
        lastY = y;

        const max = document.documentElement.scrollHeight - innerHeight;
        if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

        const mid = innerHeight / 2;
        let active = -1, best = Infinity;

        arts.forEach((s, i) => {
            const r = chapters[i].getBoundingClientRect();
            const off = (r.top + r.height / 2 - mid) / innerHeight;
            s.py = lerp(s.py, off * -35, 0.1);
            s.rx = lerp(s.rx, s.trx, 0.08);
            s.ry = lerp(s.ry, s.try_, 0.08);
            if (s.el) {
                s.el.style.transform =
                    `translateY(${s.py.toFixed(1)}px) perspective(900px) rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg)`;
            }
            const d = Math.abs(off);
            if (d < best && r.top < innerHeight && r.bottom > 0) { best = d; active = i; }
        });

        if (counter && counterNum) {
            counter.classList.toggle("show", active >= 0);
            if (active >= 0) counterNum.textContent = String(active + 1).padStart(2, "0");
        }

        if (track) {
            mx -= 0.6 + Math.abs(vel) * 0.5;
            if (mx <= -trackW) mx += trackW;
            track.style.transform = `translateX(${mx}px) skewX(${(-vel * 0.25).toFixed(2)}deg)`;
        }

        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
    addEventListener("resize", () => { if (track) trackW = track.scrollWidth / 2; });
})();


/* ===================================================== 
   3. MONET PAGE (monet.html): gallery + timeline
===================================================== */

/* MONET PAGE — timeline + progress (load after script.js).
   Menu, cursor, theme and music are already handled by script.js. */
(function () {
    const page = document.querySelector(".life-page");
    if (!page) return;

    /* ---------- SCROLL PROGRESS ---------- */
    const bar = document.querySelector(".progress");

    function progress() {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (bar) bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    }

    window.addEventListener("scroll", progress, { passive: true });
    progress();

    /* ---------- GALLERY: reveal, missing images, lightbox ---------- */
    const shots = [...page.querySelectorAll(".shot")];

    if ("IntersectionObserver" in window) {
        const gio = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add("in"); gio.unobserve(e.target); }
            });
        }, { threshold: 0.15 });
        shots.forEach((s, i) => { s.style.transitionDelay = `${(i % 3) * 0.1}s`; gio.observe(s); });
    } else {
        shots.forEach(s => s.classList.add("in"));
    }

    shots.forEach(s => {
        const img = s.querySelector("img");
        s.tabIndex = 0;
        s.setAttribute("role", "button");
        img.addEventListener("error", () => s.classList.add("missing"));
        if (img.complete && img.naturalWidth === 0) s.classList.add("missing");
    });

    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.hidden = true;
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.innerHTML = `
        <button type="button" class="lightbox-close" aria-label="Close">✕</button>
        <figure><img alt=""><figcaption></figcaption></figure>`;
    document.body.appendChild(lb);

    const lbImg = lb.querySelector("img");
    const lbCap = lb.querySelector("figcaption");
    let lastFocus = null;

    function openShot(s) {
        const img = s.querySelector("img");
        if (s.classList.contains("missing")) return;
        lastFocus = document.activeElement;
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        lbCap.innerHTML = s.querySelector("figcaption").innerHTML;
        lb.hidden = false;
        document.body.style.overflow = "hidden";
        requestAnimationFrame(() => lb.classList.add("open"));
        lb.querySelector(".lightbox-close").focus();
    }

    function closeShot() {
        lb.classList.remove("open");
        document.body.style.overflow = "";
        setTimeout(() => { lb.hidden = true; }, 400);
        if (lastFocus) lastFocus.focus();
    }

    shots.forEach(s => {
        s.addEventListener("click", () => openShot(s));
        s.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openShot(s); }
        });
    });

    lb.addEventListener("click", e => { if (e.target === lb) closeShot(); });
    lb.querySelector(".lightbox-close").addEventListener("click", closeShot);
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !lb.hidden) closeShot(); });

    /* ---------- TIMELINE ---------- */
    const items   = [...page.querySelectorAll(".life-item")];
    const yearEl  = document.getElementById("yearNow");
    const placeEl = document.getElementById("placeNow");
    const box     = page.querySelector(".life-year");

    if (!items.length || !yearEl || !placeEl) return;

    let current = null;
    let timer;

    function setActive(item) {
        if (item === current) return;
        current = item;

        items.forEach(i => i.classList.toggle("active", i === item));

        box.classList.add("swap");
        clearTimeout(timer);
        timer = setTimeout(() => {
            yearEl.textContent  = item.dataset.year;
            placeEl.textContent = item.dataset.place;
            box.classList.remove("swap");
        }, 180);
    }

    if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) setActive(entry.target);
            });
        }, { rootMargin: "-45% 0px -45% 0px" });

        items.forEach(i => io.observe(i));
    } else {
        items.forEach(i => i.classList.add("active"));
    }

    setActive(items[0]);
})();


/* ===================================================== 
   4. WORKS PAGE (works.html): rooms + lightbox
===================================================== */

/* WORKS PAGE (load after script.js; menu, cursor, theme are handled there) */
(function () {
    const page = document.querySelector(".works-page");
    if (!page) return;

    /* ---------- SCROLL PROGRESS ---------- */
    const bar = document.querySelector(".progress");
    function progress() {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (bar) bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    }
    window.addEventListener("scroll", progress, { passive: true });
    progress();

    /* ---------- WORKS: reveal + missing images ---------- */
    const works = [...page.querySelectorAll(".work")];

    if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
            });
        }, { threshold: 0.12 });
        works.forEach((w, i) => { w.style.transitionDelay = `${(i % 3) * 0.1}s`; io.observe(w); });
    } else {
        works.forEach(w => w.classList.add("in"));
    }

    works.forEach(w => {
        const img = w.querySelector("img");
        img.addEventListener("error", () => w.classList.add("missing"));
        if (img.complete && img.naturalWidth === 0) w.classList.add("missing");
    });

    /* ---------- ROOM NAV: highlight the room on screen ---------- */
    const rooms = [...page.querySelectorAll(".room")];
    const links = [...page.querySelectorAll(".room-nav a")];

    if ("IntersectionObserver" in window) {
        const rio = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
                }
            });
        }, { rootMargin: "-40% 0px -55% 0px" });
        rooms.forEach(r => rio.observe(r));
    }

    /* ---------- LIGHTBOX (prev / next inside the same room) ---------- */
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.hidden = true;
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.innerHTML = `
        <button type="button" class="lb-btn lb-close" aria-label="Close">✕</button>
        <button type="button" class="lb-btn lb-prev" aria-label="Previous work">←</button>
        <button type="button" class="lb-btn lb-next" aria-label="Next work">→</button>
        <figure><img alt=""><figcaption></figcaption></figure>`;
    document.body.appendChild(lb);

    const lbImg = lb.querySelector("img");
    const lbCap = lb.querySelector("figcaption");
    let list = [], index = 0, lastFocus = null;

    function show(i) {
        index = (i + list.length) % list.length;
        const w = list[index];
        const img = w.querySelector("img");
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        lbCap.innerHTML = w.querySelector("figcaption").innerHTML;
    }

    function open(w) {
        if (w.classList.contains("missing")) return;
        lastFocus = document.activeElement;
        list = [...w.closest(".room").querySelectorAll(".work:not(.missing)")];
        show(list.indexOf(w));
        lb.hidden = false;
        document.body.style.overflow = "hidden";
        requestAnimationFrame(() => lb.classList.add("open"));
        lb.querySelector(".lb-close").focus();
    }

    function close() {
        lb.classList.remove("open");
        document.body.style.overflow = "";
        setTimeout(() => { lb.hidden = true; }, 400);
        if (lastFocus) lastFocus.focus();
    }

    works.forEach(w => {
        w.addEventListener("click", () => open(w));
        w.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(w); }
        });
    });

    lb.addEventListener("click", e => { if (e.target === lb) close(); });
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-prev").addEventListener("click", () => show(index - 1));
    lb.querySelector(".lb-next").addEventListener("click", () => show(index + 1));

    document.addEventListener("keydown", e => {
        if (lb.hidden) return;
        if (e.key === "Escape") close();
        if (e.key === "ArrowLeft") show(index - 1);
        if (e.key === "ArrowRight") show(index + 1);
    });
})();


/* ===================================================== 
   5. SHARED BACKGROUND MUSIC (every page)
===================================================== */

/* MONET — shared background music (load on EVERY page).
   Creates its own <audio> and button, and remembers on/off + position
   in localStorage, so the song continues when you change page. */
(function () {

    const SRC = "MONET SOUND.mp3";     // path of the song, relative to the HTML pages
    const KEY = "monet-music";

    /* ---------- saved state ---------- */
    function load() {
        try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
        catch (e) { return {}; }
    }

    function save(patch) {
        try {
            const s = Object.assign(load(), patch, { ts: Date.now() });
            localStorage.setItem(KEY, JSON.stringify(s));
        } catch (e) {}
    }

    const saved = load();

    /* ---------- audio ---------- */
    const audio = document.createElement("audio");
    audio.id = "bg-music";
    audio.src = SRC;
    audio.loop = true;
    audio.preload = "auto";

    function resumePosition() {
        if (!saved.time) return;
        // add the little time that passed while the new page loaded
        const gap = saved.playing && saved.ts ? Math.min(2, (Date.now() - saved.ts) / 1000) : 0;
        const d = audio.duration;
        let t = saved.time + gap;
        if (isFinite(d) && d > 0) t = t % d;
        try { audio.currentTime = t; } catch (e) {}
    }

    audio.addEventListener("loadedmetadata", resumePosition, { once: true });

    /* ---------- button ---------- */
    let btn = null;

    function label() {
        if (btn) btn.textContent = audio.paused ? "MUSIC OFF" : "MUSIC ON";
    }

    audio.addEventListener("play",  () => { label(); });
    audio.addEventListener("pause", () => { label(); });

    function makeButton() {
        btn = document.getElementById("music-toggle") || document.createElement("button");
        btn.id = "music-toggle";
        btn.type = "button";
        btn.className = "music-button";
        btn.setAttribute("aria-label", "Toggle background music");
        if (!btn.parentNode) document.body.appendChild(btn);
        label();

        btn.addEventListener("click", () => {
            if (audio.paused) {
                audio.play().then(() => save({ playing: true, time: audio.currentTime }))
                            .catch(() => {});
            } else {
                audio.pause();
                save({ playing: false, time: audio.currentTime });
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", makeButton);
    } else {
        makeButton();
    }

    /* ---------- resume if it was playing on the previous page ---------- */
    if (saved.playing) {
        audio.play().catch(() => {
            // browser blocked autoplay: start on the first click, key or tap
            const start = e => {
                if (e && e.target && e.target.closest && e.target.closest("#music-toggle")) return;
                audio.play().catch(() => {});
                ["pointerdown", "keydown", "touchend"].forEach(t =>
                    document.removeEventListener(t, start, true));
            };
            ["pointerdown", "keydown", "touchend"].forEach(t =>
                document.addEventListener(t, start, true));
        });
    }

    /* ---------- keep saving the position ---------- */
    function snapshot() {
        save({ playing: !audio.paused, time: audio.currentTime });
    }

    setInterval(() => { if (!audio.paused) snapshot(); }, 300);
    window.addEventListener("pagehide", snapshot);
    window.addEventListener("beforeunload", snapshot);
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") snapshot();
    });

})();