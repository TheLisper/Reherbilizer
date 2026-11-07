"use strict";

/* ---- Settings: change these before you submit ---- */
const RECIPIENT = "you@example.com";          // where contact/enquiry emails go
const MAP_CENTER = [-26.2041, 28.0473];       // latitude, longitude of your location

/* ---- Service data (sample cost and availability: edit to match your programme) ---- */
const SERVICES = [
  { id: "herbal", name: "Herbal Therapy", category: "Wellness", cost: 0, costText: "Free for youth", availability: "Tuesdays and Thursdays, 16:00",
    text: "We provide natural herbal remedies to support mental and physical health." },
  { id: "coaching", name: "Life-Skills Coaching", category: "Coaching", cost: 50, costText: "R50 per session (sponsored places available)", availability: "Mondays and Wednesdays, 15:30",
    text: "Our experienced coaches guide youth toward positive choices and future success." },
  { id: "community", name: "Community Support Programs", category: "Community", cost: 0, costText: "Free", availability: "Saturdays, 10:00",
    text: "We offer peer groups and mentorship programs to foster a sense of community and support among young people." }
];

const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---- Scroll reveal animation ---- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) { items.forEach((i) => i.classList.add("visible")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  items.forEach((i) => io.observe(i));
}

/* ---- Accordion (About page) ---- */
function initAccordion() {
  document.querySelectorAll(".accordion button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      document.getElementById(btn.getAttribute("aria-controls")).classList.toggle("open", !open);
    });
  });
}

/* ---- Gallery lightbox (Home page) ---- */
function initLightbox() {
  const box = $("#lightbox");
  if (!box) return;
  const img = box.querySelector("img"), cap = box.querySelector("p");
  const close = () => box.classList.remove("open");
  document.querySelectorAll("#gallery img").forEach((thumb) => {
    thumb.parentElement.addEventListener("click", () => {
      img.src = thumb.src; img.alt = thumb.alt; cap.textContent = thumb.alt;
      box.classList.add("open");
      $("#lightbox-close").focus();
    });
  });
  $("#lightbox-close").addEventListener("click", close);
  box.addEventListener("click", (e) => { if (e.target === box) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

/* ---- Dynamic services with search, filter and sort ---- */
function initServices() {
  const list = $("#service-list");
  if (!list) return;
  const search = $("#search"), cat = $("#category"), sort = $("#sort"), none = $("#no-results");
  [...new Set(SERVICES.map((s) => s.category))].forEach((c) => cat.add(new Option(c, c)));

  function render() {
    const q = search.value.trim().toLowerCase();
    const result = SERVICES
      .filter((s) => (cat.value === "all" || s.category === cat.value) && (s.name + " " + s.text).toLowerCase().includes(q))
      .sort((a, b) => sort.value === "cost" ? a.cost - b.cost : a.name.localeCompare(b.name));
    list.innerHTML = result.map((s) =>
      `<article class="card"><h3>${esc(s.name)}</h3><p>${esc(s.text)}</p>` +
      `<p class="meta"><strong>Cost:</strong> ${esc(s.costText)}<br><strong>When:</strong> ${esc(s.availability)}</p></article>`).join("");
    none.hidden = result.length > 0;
  }
  [search, cat, sort].forEach((el) => el.addEventListener("input", render));
  render();
}

/* ---- Form validation helpers ---- */
const RULES = {
  name: (v) => (v.length < 2 || v.length > 60) ? "Enter your name (2 to 60 characters)." : /^[A-Za-z\u00C0-\u024F' -]+$/.test(v) ? "" : "Use letters only in your name.",
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Enter a valid email address, like name@example.com.",
  phone: (v) => /^(\+27|0)[6-8][0-9]{8}$/.test(v.replace(/[\s-]/g, "")) ? "" : "Enter a valid South African number, like 082 123 4567.",
  type: (v) => v ? "" : "Choose an option.",
  service: (v) => v ? "" : "Choose a service.",
  date: (v) => {
    if (!v) return "Choose a start date.";
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return new Date(v) < today ? "Choose today or a future date." : "";
  },
  message: (v, max) => v.length < 10 ? "Write at least 10 characters." : v.length > max ? `Keep your message under ${max} characters.` : ""
};

function validateField(form, id) {
  const el = form.elements[id];
  if (!el || (el.closest("[hidden]"))) return true;
  const v = el.value.trim();
  let msg = "";
  if (!v && !el.required) msg = "";
  else if (!v && el.required && id !== "message") msg = id === "type" || id === "service" ? RULES[id](v) : "This field is required.";
  else if (RULES[id]) msg = RULES[id](v, el.maxLength > 0 ? el.maxLength : 1000);
  const err = document.getElementById(id + "-error");
  if (err) err.textContent = msg;
  el.setAttribute("aria-invalid", msg ? "true" : "false");
  return !msg;
}

function validateForm(form) {
  const ids = [...form.elements].filter((e) => e.id && RULES[e.id]).map((e) => e.id);
  const results = ids.map((id) => validateField(form, id));
  const firstBad = ids.find((id, i) => !results[i]);
  if (firstBad) form.elements[firstBad].focus();
  return !firstBad;
}

function liveValidate(form) {
  [...form.elements].forEach((el) => {
    if (el.id && RULES[el.id]) {
      el.addEventListener("blur", () => validateField(form, el.id));
      el.addEventListener("input", () => { if (el.getAttribute("aria-invalid") === "true") validateField(form, el.id); });
    }
  });
}

/* ---- AJAX submission (FormSubmit service sends the email to RECIPIENT) ---- */
async function sendAjax(data) {
  const res = await fetch("https://formsubmit.co/ajax/" + encodeURIComponent(RECIPIENT), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Request failed");
  return res.json();
}

/* ---- Contact form ---- */
function initContact() {
  const form = $("#contact-form");
  if (!form) return;
  const status = $("#status");
  liveValidate(form);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;
    const data = Object.fromEntries(new FormData(form));
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true; btn.textContent = "Sending...";
    status.hidden = false;
    try {
      await sendAjax({ ...data, _subject: "Website message: " + data.type });
      status.className = "status ok";
      status.textContent = "Thank you, " + data.name + ". Your message was sent and we will reply soon.";
      form.reset();
    } catch (err) {
      const body = `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || "n/a"}\nType: ${data.type}\n\n${data.message}`;
      const href = `mailto:${RECIPIENT}?subject=${encodeURIComponent("Website message: " + data.type)}&body=${encodeURIComponent(body)}`;
      status.className = "status fail";
      status.innerHTML = `We could not send your message automatically. <a href="${esc(href)}">Send it from your email app instead</a>.`;
    }
    btn.disabled = false; btn.textContent = "Send Message";
    status.focus();
  });
}

/* ---- Enquiry form: validate, send, then show a cost/availability response ---- */
function initEnquiry() {
  const form = $("#enquiry-form");
  if (!form) return;
  const type = $("#type"), wrap = $("#service-wrap"), svc = $("#service"), out = $("#response");
  SERVICES.forEach((s) => svc.add(new Option(s.name, s.id)));
  const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  form.elements.date.min = d.toISOString().slice(0, 10);
  type.addEventListener("change", () => { wrap.hidden = type.value !== "service"; });
  liveValidate(form);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;
    const data = Object.fromEntries(new FormData(form));
    const first = esc(data.name.split(" ")[0]);
    let html;
    if (data.type === "service") {
      const s = SERVICES.find((x) => x.id === data.service);
      html = `<strong>Thanks, ${first}.</strong> Here is what you asked about:<br><strong>${esc(s.name)}</strong><br>` +
             `Cost: ${esc(s.costText)}<br>Availability: ${esc(s.availability)}<br>We will confirm a place from ${esc(data.date)} by email.`;
    } else if (data.type === "volunteer") {
      html = `<strong>Thanks, ${first}.</strong> Volunteering is unpaid and we have places open now. Our coordinator will contact you within 3 working days.`;
    } else {
      html = `<strong>Thanks, ${first}.</strong> Sponsors can fund a coaching place from R50 per session. We will email you sponsorship details within 3 working days.`;
    }
    out.innerHTML = html; out.hidden = false; out.focus();
    sendAjax({ ...data, _subject: "Website enquiry: " + data.type }).catch(() => {});
  });
}

/* ---- Interactive map (Leaflet, contact page) ---- */
function initMap() {
  const el = $("#map");
  if (!el || typeof L === "undefined") return;
  const map = L.map(el).setView(MAP_CENTER, 13);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19, attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
  L.marker(MAP_CENTER).addTo(map).bindPopup("<strong>Reherbalizer</strong><br>Visit us here.").openPopup();
}

document.addEventListener("DOMContentLoaded", () => {
  initReveal(); initAccordion(); initLightbox(); initServices(); initContact(); initEnquiry(); initMap();
});
