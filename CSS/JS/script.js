const menuButton = document.getElementById("menuButton");
const menu = document.getElementById("menu");

const cursor = document.querySelector(".cursor");
const light = document.querySelector(".light");
const background = document.querySelector(".background");


/* MENU */
menuButton.addEventListener("click", () => {
    menu.classList.toggle("active");
    const lines = menuButton.querySelectorAll("span");

    if (menu.classList.contains("active")) {
        lines[0].style.transform = "rotate(45deg) translate(4px, 4px)";
        lines[1].style.transform = "rotate(-45deg) translate(4px, -4px)";
    } else {
        lines[0].style.transform = "";
        lines[1].style.transform = "";
    }
});


/* CLOSE MENU */
document.querySelectorAll(".menu-links a").forEach(link => {
    link.addEventListener("click", () => {
        menu.classList.remove("active");
        const lines = menuButton.querySelectorAll("span");
        lines[0].style.transform = "";
        lines[1].style.transform = "";
    });
});


/* CURSOR + LIGHT + PARALLAX
   (light and background only exist on the home page,
   so each one is checked before it is used) */
document.addEventListener("mousemove", (e) => {

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


/* CURSOR HOVER */
document.querySelectorAll("a, button").forEach(element => {

    element.addEventListener("mouseenter", () => {
        if (!cursor) return;
        cursor.style.width = "40px";
        cursor.style.height = "40px";
    });

    element.addEventListener("mouseleave", () => {
        if (!cursor) return;
        cursor.style.width = "12px";
        cursor.style.height = "12px";
    });

});

/* =====================================================
   VISIT PAGE ONLY
   Load AFTER script.js, only in visit.html
===================================================== */

(function () {

    const TICKETS = [
        { id: "standard", label: "STANDARD", price: 18, note: "" },
        { id: "student",  label: "STUDENT",  price: 14, note: "Valid ID required at entry" },
        { id: "child",    label: "UNDER 12", price: 0,  note: "Must be with a paying visitor" }
    ];

    const MAX_PER_TYPE = 10;
    const euro = n => `€${n}`;


    /* =========================
       OPEN IN MAPS
    ========================= */

    const mapsLink = document.querySelector(".info-block .text-link");

    if (mapsLink) {
        const address = "Monet Immersive Experience, 12 Rue de l'Art, 75004 Paris, France";
        mapsLink.href =
            "https://www.google.com/maps/search/?api=1&query=" +
            encodeURIComponent(address);
        mapsLink.target = "_blank";
        mapsLink.rel = "noopener";
    }


    /* =========================
       CURSOR HOVER (works for
       elements created later too)
    ========================= */

    const cursor = document.querySelector(".cursor");
    const hoverSelector = "a, button, input, textarea, select";

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


    /* =========================
       TICKET MODAL
    ========================= */

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

                <button type="button" class="send-button modal-confirm" id="ticketConfirm">
                    CONFIRM ORDER ↗
                </button>

            </div>

            <div id="ticketDone" hidden>
                <p class="modal-eyebrow">CONFIRMED</p>
                <h2>See you <em>soon.</em></h2>
                <p class="modal-summary" id="ticketSummary"></p>
                <button type="button" class="send-button modal-confirm" id="ticketClose">
                    CLOSE ↗
                </button>
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

    // entry times: 10:00 to last entry 19:00
    for (let h = 10; h <= 19; h++) {
        const o = document.createElement("option");
        o.value = o.textContent = `${String(h).padStart(2, "0")}:00`;
        timeSelect.appendChild(o);
    }

    // date can't be in the past
    const today = new Date();
    const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString().slice(0, 10);
    dateInput.min = dateInput.value = iso(today);

    function total() {
        return TICKETS.reduce((sum, t) => sum + t.price * quantities[t.id], 0);
    }

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
        if (e.target === modal) return closeModal();           // backdrop

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

        const count = Object.values(quantities).reduce((a, b) => a + b, 0);
        const paying = quantities.standard + quantities.student;

        if (!dateInput.value) {
            errorEl.textContent = "Choose a date for your visit.";
            return;
        }
        if (count === 0) {
            errorEl.textContent = "Add at least one ticket.";
            return;
        }
        if (paying === 0) {
            errorEl.textContent = "Children under 12 must come with a standard or student ticket.";
            return;
        }

        /* ---------------------------------------------
           PAYMENT GOES HERE.
           This page has no backend, so nothing is charged.
           Send `order` to your server / Stripe Checkout and
           only show the confirmation after it succeeds.
        --------------------------------------------- */
        const order = {
            date: dateInput.value,
            time: timeSelect.value,
            tickets: { ...quantities },
            total: total()
        };
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


    /* =========================
       CONTACT FORM
    ========================= */

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

            if (!name || !email || !message) {
                status.textContent = "Fill in your name, email and question.";
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                status.textContent = "Enter a valid email address.";
                return;
            }

            /* Send to your backend or a form service here
               (Formspree, Netlify Forms, EmailJS...). */
            console.log("Question:", { name, email, message });

            form.reset();
            status.classList.add("ok");
            status.textContent = "Thanks, we'll reply by email soon.";
        });
    }

})();