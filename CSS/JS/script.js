/* Monet site: one script for every page.
   Each section looks for its own page and quietly exits if it isn't there,
   so it's safe to load this file everywhere:

   <script src="CSS/JS/script.js" defer></script>
*/


/* ---------- Theme (light / dark) ---------- */

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
        if (!btn) return;

        btn.setAttribute("aria-pressed", theme === "light");
        btn.setAttribute("aria-label", theme === "light" ? "Switch to dark mode" : "Switch to light mode");
        btn.querySelector("span").textContent = theme === "light" ? "DARK" : "LIGHT";
    }

    apply(current());

    document.addEventListener("DOMContentLoaded", () => {
        if (document.getElementById("themeToggle")) return;

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

    media.addEventListener("change", () => {
        if (!saved()) apply(current());
    });
})();


/* ---------- Shared helper: scroll progress bar ---------- */

function initScrollProgress() {
    const bar = document.querySelector(".progress");
    if (!bar) return;

    function update() {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    }

    window.addEventListener("scroll", update, { passive: true });
    update();
}


/* ---------- Menu ---------- */

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


/* ---------- Cursor + home page light ---------- */

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

    // Grow the cursor over anything clickable (works for elements added later too)
    if (!cursor) return;

    const clickable = "a, button, input, textarea, select, .work, .shot";

    document.addEventListener("mouseover", e => {
        if (e.target.closest(clickable)) {
            cursor.style.width = "40px";
            cursor.style.height = "40px";
        }
    });

    document.addEventListener("mouseout", e => {
        if (e.target.closest(clickable)) {
            cursor.style.width = "12px";
            cursor.style.height = "12px";
        }
    });
})();


/* ---------- Visit page: tickets + contact form ---------- */

(function () {
    const TICKETS = [
        { id: "standard", label: "STANDARD", price: 45, note: "" },
        { id: "student",  label: "STUDENT",  price: 35, note: "Valid ID required at entry" },
        { id: "child",    label: "UNDER 12", price: 0,  note: "Must be with a paying visitor" }
    ];

    const MAX_PER_TYPE = 10;
    const euro = n => `€${n}`;

    // "Open in maps" link
    const mapsLink = document.querySelector(".info-block .text-link");
    if (mapsLink) {
        const address = "Monet Immersive Experience, 12 Rue de l'Art, 75004 Paris, France";
        mapsLink.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(address);
        mapsLink.target = "_blank";
        mapsLink.rel = "noopener";
    }

    // Ticket modal
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

    // Entry slots from 10:00 to 19:00
    for (let h = 10; h <= 19; h++) {
        const option = document.createElement("option");
        option.value = option.textContent = `${String(h).padStart(2, "0")}:00`;
        timeSelect.appendChild(option);
    }

    // Default to today and don't allow past dates
    const toISODate = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    dateInput.min = dateInput.value = toISODate(new Date());

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

    buyButton.addEventListener("click", e => {
        e.preventDefault();
        openModal();
    });

    modal.addEventListener("click", e => {
        if (e.target === modal) return closeModal();

        const stepButton = e.target.closest("[data-step]");
        if (!stepButton) return;

        const id = stepButton.dataset.id;
        const next = quantities[id] + Number(stepButton.dataset.step);
        quantities[id] = Math.min(MAX_PER_TYPE, Math.max(0, next));
        errorEl.textContent = "";
        render();
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

        // TODO: take payment here
        const order = { date: dateInput.value, time: timeSelect.value, tickets: { ...quantities }, total: total() };
        console.log("Order:", order);

        const summary = TICKETS
            .filter(t => quantities[t.id] > 0)
            .map(t => `${quantities[t.id]} × ${t.label.toLowerCase()}`)
            .join(", ");

        $("ticketSummary").textContent =
            `${summary} — ${dateInput.value} at ${timeSelect.value}. Total: ${euro(order.total)}.`;

        stepEl.hidden = true;
        doneEl.hidden = false;
        $("ticketClose").focus();
    });

    render();

    // Contact form
    const form = document.querySelector(".contact-form");
    if (!form) return;

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

        if (!name || !email || !message) {
            status.textContent = "Fill in your name, email and question.";
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            status.textContent = "Enter a valid email address.";
            return;
        }

        // TODO: send to a backend or form service
        console.log("Question:", { name, email, message });

        form.reset();
        status.classList.add("ok");
        status.textContent = "Thanks, we'll reply by email soon.";
    });
})();


/* ---------- Experience page: scroll motion ---------- */

(function () {
    const page = document.querySelector(".experience-page");
    if (!page) return;

    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lerp = (a, b, t) => a + (b - a) * t;

    // Number count-up
    const counters = page.querySelectorAll("[data-count]");

    function countUp(el) {
        const end = Number(el.dataset.count);
        if (reduceMotion) { el.textContent = end; return; }

        const start = performance.now();
        const duration = 1600;

        (function tick(now) {
            const p = Math.min(1, (now - start) / duration);
            el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
            if (p < 1) requestAnimationFrame(tick);
        })(start);
    }

    // Fade in chapters and .reveal blocks as they scroll into view
    const chapters = [...page.querySelectorAll(".chapter")];
    const reveals  = [...page.querySelectorAll(".reveal")];
    const fadeIns  = chapters.concat(reveals);

    if ("IntersectionObserver" in window) {
        const countObserver = new IntersectionObserver(entries => entries.forEach(entry => {
            if (entry.isIntersecting) {
                countUp(entry.target);
                countObserver.unobserve(entry.target);
            }
        }), { threshold: 0.6 });
        counters.forEach(c => countObserver.observe(c));

        const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in");
                revealObserver.unobserve(entry.target);
            }
        }), { threshold: 0.15 });
        fadeIns.forEach(el => revealObserver.observe(el));
    } else {
        counters.forEach(countUp);
        fadeIns.forEach(el => el.classList.add("in"));
    }

    // Everything below is motion, so skip it if the visitor asked for less
    if (reduceMotion) {
        fadeIns.forEach(el => el.classList.add("in"));
        return;
    }

    // Room counter + tilt on the artwork
    const counter = page.querySelector(".room-counter");
    const counterNum = counter && counter.querySelector("b");

    const arts = chapters.map(chapter => {
        const el = chapter.querySelector(".chapter-art");
        const s = { el, rx: 0, ry: 0, targetRx: 0, targetRy: 0, py: 0 };
        if (!el) return s;

        el.addEventListener("mousemove", e => {
            const r = el.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width;
            const y = (e.clientY - r.top) / r.height;
            s.targetRy = (x - 0.5) * 8;
            s.targetRx = (0.5 - y) * 6;
            el.style.setProperty("--mx", x * 100 + "%");
            el.style.setProperty("--my", y * 100 + "%");
        });

        el.addEventListener("mouseleave", () => {
            s.targetRx = 0;
            s.targetRy = 0;
        });

        return s;
    });

    // Marquee
    const track = page.querySelector(".marquee .track");
    let marqueeX = 0;
    let trackWidth = track ? track.scrollWidth / 2 : 0;

    // One animation loop for progress bar, parallax, counter and marquee
    const bar = document.querySelector(".progress");
    let lastY = window.scrollY;
    let velocity = 0;

    function frame() {
        const y = window.scrollY;
        velocity = lerp(velocity, y - lastY, 0.12);
        lastY = y;

        const max = document.documentElement.scrollHeight - innerHeight;
        if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

        const mid = innerHeight / 2;
        let active = -1;
        let closest = Infinity;

        arts.forEach((s, i) => {
            const r = chapters[i].getBoundingClientRect();
            const offset = (r.top + r.height / 2 - mid) / innerHeight;

            s.py = lerp(s.py, offset * -35, 0.1);
            s.rx = lerp(s.rx, s.targetRx, 0.08);
            s.ry = lerp(s.ry, s.targetRy, 0.08);

            if (s.el) {
                s.el.style.transform =
                    `translateY(${s.py.toFixed(1)}px) perspective(900px) rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg)`;
            }

            const distance = Math.abs(offset);
            if (distance < closest && r.top < innerHeight && r.bottom > 0) {
                closest = distance;
                active = i;
            }
        });

        if (counter && counterNum) {
            counter.classList.toggle("show", active >= 0);
            if (active >= 0) counterNum.textContent = String(active + 1).padStart(2, "0");
        }

        if (track) {
            marqueeX -= 0.6 + Math.abs(velocity) * 0.5;
            if (marqueeX <= -trackWidth) marqueeX += trackWidth;
            track.style.transform = `translateX(${marqueeX}px) skewX(${(-velocity * 0.25).toFixed(2)}deg)`;
        }

        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);

    addEventListener("resize", () => {
        if (track) trackWidth = track.scrollWidth / 2;
    });
})();


/* ---------- Monet page: gallery + timeline ---------- */

(function () {
    const page = document.querySelector(".life-page");
    if (!page) return;

    initScrollProgress();

    // Gallery: fade in, handle missing images
    const shots = [...page.querySelectorAll(".shot")];

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        shots.forEach((shot, i) => {
            shot.style.transitionDelay = `${(i % 3) * 0.1}s`;
            observer.observe(shot);
        });
    } else {
        shots.forEach(shot => shot.classList.add("in"));
    }

    shots.forEach(shot => {
        const img = shot.querySelector("img");
        shot.tabIndex = 0;
        shot.setAttribute("role", "button");
        img.addEventListener("error", () => shot.classList.add("missing"));
        if (img.complete && img.naturalWidth === 0) shot.classList.add("missing");
    });

    // Gallery: lightbox
    const lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.hidden = true;
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.innerHTML = `
        <button type="button" class="lightbox-close" aria-label="Close">✕</button>
        <figure><img alt=""><figcaption></figcaption></figure>`;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector("img");
    const lightboxCaption = lightbox.querySelector("figcaption");
    let lastFocus = null;

    function openShot(shot) {
        if (shot.classList.contains("missing")) return;

        const img = shot.querySelector("img");
        lastFocus = document.activeElement;
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.innerHTML = shot.querySelector("figcaption").innerHTML;
        lightbox.hidden = false;
        document.body.style.overflow = "hidden";
        requestAnimationFrame(() => lightbox.classList.add("open"));
        lightbox.querySelector(".lightbox-close").focus();
    }

    function closeShot() {
        lightbox.classList.remove("open");
        document.body.style.overflow = "";
        setTimeout(() => { lightbox.hidden = true; }, 400);
        if (lastFocus) lastFocus.focus();
    }

    shots.forEach(shot => {
        shot.addEventListener("click", () => openShot(shot));
        shot.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openShot(shot);
            }
        });
    });

    lightbox.addEventListener("click", e => { if (e.target === lightbox) closeShot(); });
    lightbox.querySelector(".lightbox-close").addEventListener("click", closeShot);
    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && !lightbox.hidden) closeShot();
    });

    // Timeline: update the year and place as you scroll
    const items   = [...page.querySelectorAll(".life-item")];
    const yearEl  = document.getElementById("yearNow");
    const placeEl = document.getElementById("placeNow");
    const box     = page.querySelector(".life-year");

    if (!items.length || !yearEl || !placeEl) return;

    let current = null;
    let swapTimer;

    function setActive(item) {
        if (item === current) return;
        current = item;

        items.forEach(i => i.classList.toggle("active", i === item));

        box.classList.add("swap");
        clearTimeout(swapTimer);
        swapTimer = setTimeout(() => {
            yearEl.textContent  = item.dataset.year;
            placeEl.textContent = item.dataset.place;
            box.classList.remove("swap");
        }, 180);
    }

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) setActive(entry.target);
            });
        }, { rootMargin: "-45% 0px -45% 0px" });

        items.forEach(i => observer.observe(i));
    } else {
        items.forEach(i => i.classList.add("active"));
    }

    setActive(items[0]);
})();


/* ---------- Works page: rooms + lightbox ---------- */

(function () {
    const page = document.querySelector(".works-page");
    if (!page) return;

    initScrollProgress();

    // Fade in works, handle missing images
    const works = [...page.querySelectorAll(".work")];

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        works.forEach((work, i) => {
            work.style.transitionDelay = `${(i % 3) * 0.1}s`;
            observer.observe(work);
        });
    } else {
        works.forEach(work => work.classList.add("in"));
    }

    works.forEach(work => {
        const img = work.querySelector("img");
        img.addEventListener("error", () => work.classList.add("missing"));
        if (img.complete && img.naturalWidth === 0) work.classList.add("missing");
    });

    // Room nav: highlight the room currently on screen
    const rooms = [...page.querySelectorAll(".room")];
    const links = [...page.querySelectorAll(".room-nav a")];

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                links.forEach(a => {
                    a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
                });
            });
        }, { rootMargin: "-40% 0px -55% 0px" });

        rooms.forEach(room => observer.observe(room));
    }

    // Lightbox with prev / next inside the same room
    const lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.hidden = true;
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.innerHTML = `
        <button type="button" class="lb-btn lb-close" aria-label="Close">✕</button>
        <button type="button" class="lb-btn lb-prev" aria-label="Previous work">←</button>
        <button type="button" class="lb-btn lb-next" aria-label="Next work">→</button>
        <figure><img alt=""><figcaption></figcaption></figure>`;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector("img");
    const lightboxCaption = lightbox.querySelector("figcaption");
    let list = [];
    let index = 0;
    let lastFocus = null;

    function show(i) {
        index = (i + list.length) % list.length;
        const work = list[index];
        const img = work.querySelector("img");
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.innerHTML = work.querySelector("figcaption").innerHTML;
    }

    function open(work) {
        if (work.classList.contains("missing")) return;

        lastFocus = document.activeElement;
        list = [...work.closest(".room").querySelectorAll(".work:not(.missing)")];
        show(list.indexOf(work));
        lightbox.hidden = false;
        document.body.style.overflow = "hidden";
        requestAnimationFrame(() => lightbox.classList.add("open"));
        lightbox.querySelector(".lb-close").focus();
    }

    function close() {
        lightbox.classList.remove("open");
        document.body.style.overflow = "";
        setTimeout(() => { lightbox.hidden = true; }, 400);
        if (lastFocus) lastFocus.focus();
    }

    works.forEach(work => {
        work.addEventListener("click", () => open(work));
        work.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open(work);
            }
        });
    });

    lightbox.addEventListener("click", e => { if (e.target === lightbox) close(); });
    lightbox.querySelector(".lb-close").addEventListener("click", close);
    lightbox.querySelector(".lb-prev").addEventListener("click", () => show(index - 1));
    lightbox.querySelector(".lb-next").addEventListener("click", () => show(index + 1));

    document.addEventListener("keydown", e => {
        if (lightbox.hidden) return;
        if (e.key === "Escape") close();
        if (e.key === "ArrowLeft") show(index - 1);
        if (e.key === "ArrowRight") show(index + 1);
    });
})();