(function () {
  "use strict";

  var WHATSAPP_NUMBER = "393420026942";

  var PHONE_NUMBER = "+393420026942";

  var lang = document.documentElement.lang === "en" ? "en" : "it";

  var DEFAULT_MESSAGE = {
    it: "Ciao! Vorrei un preventivo per Sara's Holiday Home.",
    en: "Hi! I'd like a quote for Sara's Holiday Home.",
  };

  function buildWhatsAppUrl(message) {
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
  }

  function setDefaultCtaLinks() {
    var url = buildWhatsAppUrl(DEFAULT_MESSAGE[lang]);
    document.querySelectorAll("[data-whatsapp-cta]").forEach(function (el) {
      el.setAttribute("href", url);
    });
  }

  function setPhoneLinks() {
    document.querySelectorAll("[data-tel-cta]").forEach(function (el) {
      el.setAttribute("href", "tel:" + PHONE_NUMBER);
    });
  }

  function wireCarousel(ids) {
    var car = document.getElementById(ids.car);
    var track = document.getElementById(ids.track);
    var dotsBox = document.getElementById(ids.dots);
    var countEl = document.getElementById(ids.count);
    if (!car || !track || !dotsBox || !countEl) return;

    var cards = track.children;
    var n = cards.length;
    var prev = car.querySelector(".prev");
    var next = car.querySelector(".next");
    var cur = 0;

    for (var i = 0; i < n; i++) {
      (function (i) {
        var d = document.createElement("button");
        d.type = "button";
        d.setAttribute("aria-label", (lang === "en" ? "Go to slide " : "Vai all'elemento ") + (i + 1));
        d.addEventListener("click", function () { go(i); });
        dotsBox.appendChild(d);
      })(i);
    }

    function go(i) {
      i = Math.max(0, Math.min(n - 1, i));
      track.scrollTo({ left: cards[i].offsetLeft - track.offsetLeft, behavior: "smooth" });
    }

    function update() {
      cur = Math.round(track.scrollLeft / track.clientWidth);
      prev.disabled = cur === 0;
      next.disabled = cur === n - 1;
      countEl.textContent = (cur + 1) + " / " + n;
      Array.prototype.forEach.call(dotsBox.children, function (d, j) {
        d.setAttribute("aria-current", j === cur ? "true" : "false");
      });
    }

    prev.addEventListener("click", function () { go(cur - 1); });
    next.addEventListener("click", function () { go(cur + 1); });
    track.addEventListener("scroll", function () {
      clearTimeout(track._t);
      track._t = setTimeout(update, 60);
    });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(cur + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(cur - 1); }
    });
    window.addEventListener("resize", function () { go(cur); });
    update();
  }

  function wireMobileNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-nav-menu]");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  function wireBookingForm() {
    var form = document.getElementById("booking-form");
    if (!form) return;

    var nameEl = document.getElementById("bk-name");
    var guestsEl = document.getElementById("bk-guests");
    var inEl = document.getElementById("bk-checkin");
    var outEl = document.getElementById("bk-checkout");
    var notesEl = document.getElementById("bk-notes");

    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function toISO(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
    function parseISO(v) {
      var p = v.split("-");
      return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    }
    function fmt(d) {
      return d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    }

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    inEl.min = toISO(today);
    outEl.min = toISO(today);

    inEl.addEventListener("change", function () {
      if (!inEl.value) return;
      var next = parseISO(inEl.value);
      next.setDate(next.getDate() + 1);
      outEl.min = toISO(next);
      if (outEl.value && parseISO(outEl.value) <= parseISO(inEl.value)) outEl.value = "";
    });

    function setError(el, id, msg) {
      var box = document.getElementById(id);
      if (msg) {
        box.textContent = msg;
        box.hidden = false;
        el.setAttribute("aria-invalid", "true");
      } else {
        box.textContent = "";
        box.hidden = true;
        el.removeAttribute("aria-invalid");
      }
    }

    [nameEl, guestsEl, inEl, outEl].forEach(function (el) {
      function clear() { setError(el, "err-" + el.id.replace("bk-", ""), ""); }
      el.addEventListener("input", clear);
      el.addEventListener("change", clear);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = nameEl.value.trim();
      var guests = guestsEl.value;
      var firstBad = null;

      function check(el, id, bad, msg) {
        setError(el, id, bad ? msg : "");
        if (bad && !firstBad) firstBad = el;
      }

      check(nameEl, "err-name", !name, "Scrivi il tuo nome e cognome.");
      check(guestsEl, "err-guests", !guests, "Scegli quante persone siete.");
      check(inEl, "err-checkin", !inEl.value, "Scegli la data di arrivo.");

      var outBad = !outEl.value;
      var outMsg = "Scegli la data di partenza.";
      if (!outBad && inEl.value && parseISO(outEl.value) <= parseISO(inEl.value)) {
        outBad = true;
        outMsg = "La partenza deve essere dopo la data di arrivo.";
      }
      check(outEl, "err-checkout", outBad, outMsg);

      if (firstBad) {
        firstBad.focus();
        return;
      }

      var dIn = parseISO(inEl.value);
      var dOut = parseISO(outEl.value);
      var nights = Math.round((dOut - dIn) / 86400000);
      var notes = notesEl.value.trim();

      var message = [
        "Ciao Sara! Vorrei richiedere la disponibilità per Sara's Holiday Home.",
        "",
        "Nome: " + name,
        "Ospiti: " + guests,
        "Check-in (arrivo): " + fmt(dIn),
        "Check-out (partenza): " + fmt(dOut) + " (" + nights + (nights === 1 ? " notte" : " notti") + ")",
        "Richieste particolari: " + (notes || "nessuna"),
        "",
        "Grazie!"
      ].join("\n");

      var url = buildWhatsAppUrl(message);
      var win = window.open(url, "_blank", "noopener");
      if (!win) window.location.href = url;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    wireBookingForm();
    setDefaultCtaLinks();
    setPhoneLinks();
    wireCarousel({ car: "car", track: "track", dots: "dots", count: "count" });
    wireCarousel({ car: "photo-car", track: "photo-track", dots: "photo-dots", count: "photo-count" });
    wireMobileNav();
  });
})();
