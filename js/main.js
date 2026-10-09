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

  document.addEventListener("DOMContentLoaded", function () {
    setDefaultCtaLinks();
    setPhoneLinks();
    wireCarousel({ car: "car", track: "track", dots: "dots", count: "count" });
    wireCarousel({ car: "photo-car", track: "photo-track", dots: "photo-dots", count: "photo-count" });
    wireMobileNav();
  });
})();
