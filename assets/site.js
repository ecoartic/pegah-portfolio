(function () {
  "use strict";
  const S = window.SITE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const faDigits = s => String(s).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);
  const src = p => encodeURI(p);
  let lang = "fa";
  try { lang = localStorage.getItem("pr-lang") || "fa"; } catch (e) {}
  if (/[?&]lang=en/.test(location.search)) lang = "en";
  if (/[?&]lang=fa/.test(location.search)) lang = "fa";
  const t = k => (S.i18n[lang] && S.i18n[lang][k]) || S.i18n.en[k] || k;
  const n = v => lang === "fa" ? faDigits(v) : String(v);
  const L = (o, base) => o[base ? base + "_" + lang : lang] ?? o[lang];
  const catById = id => S.categories.find(c => c.id === id);
  let currentFilter = "all";

  /* ---------- hero image (assets/hero.jpg overrides the default if present) ---------- */
  const heroImg = $("#hero-img"), heroBg = $("#hero-bg");
  function setHero(p) { heroImg.src = src(p); heroBg.src = src(p); }
  setHero(S.hero.image);
  const probe = new Image();
  probe.onload = () => setHero(S.hero.custom);
  probe.src = S.hero.custom;

  /* ---------- render all language-dependent content ---------- */
  function render() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    document.title = lang === "fa" ? "پگاه رسایی | معمار و طراح داخلی" : "Pegah Rassaii | Architect & Interior Designer";
    $$("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
    $$("[data-i18n-html]").forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    $$(".lang button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    $$(".num").forEach(el => { if (!el.dataset.i18n) el.textContent = n(el.textContent.replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))); });

    const totalImgs = S.projects.reduce((s, p) => s + p.files.length, 0);
    $("#facts").innerHTML = [
      [n(15), "<sup>+</sup>", "fact.years"], [n(S.projects.length), "", "fact.projects"],
      [n(totalImgs), "", "fact.images"], [n(S.stage.length), "", "fact.stage"]
    ].map(([v, s, k]) => `<div class="fact"><div class="n">${v}${s}</div><div class="l eyebrow">${t(k)}</div></div>`).join("");
    $("#skills").innerHTML = S.skills.map(s => `<span class="chip">${s[lang === "fa" ? 1 : 0]}</span>`).join("");
    $("#software").innerHTML = S.software.map(s => `<span class="chip">${s[lang === "fa" ? 1 : 0]}</span>`).join("");

    $("#hz").innerHTML = S.categories.map((c, i) => {
      const count = S.projects.filter(p => p.cat === c.id).length;
      return `<button class="card" type="button" data-cat="${c.id}">
        <div class="art"><img src="${src(c.cover)}" alt="" loading="lazy"></div>
        <span class="num">${n(String(i + 1).padStart(2, "0"))}</span>
        <span class="cap"><h3>${c[lang]}</h3><span class="eyebrow">${L(c, "note")} · ${n(count)} ${t("disc.projects")}</span></span>
      </button>`;
    }).join("");
    $$("#hz .card").forEach(b => b.addEventListener("click", () => { setFilter(b.dataset.cat); goTo("#projects"); }));

    $("#steps").innerHTML = S.steps.map((s, i) => `<li class="step"><span class="k">${n("0" + (i + 1))}</span><div><h3>${s[lang === "fa" ? 1 : 0]}</h3><p>${s[lang === "fa" ? 3 : 2]}</p></div></li>`).join("");

    const f = $("#filters");
    f.innerHTML = `<button type="button" data-f="all">${t("proj.all")}<span class="c">${n(S.projects.length)}</span></button>` +
      S.categories.map(c => `<button type="button" data-f="${c.id}">${c[lang]}<span class="c">${n(S.projects.filter(p => p.cat === c.id).length)}</span></button>`).join("");
    $$("button", f).forEach(b => b.addEventListener("click", () => setFilter(b.dataset.f)));

    $("#pgrid").innerHTML = S.projects.map((p, i) => `<button class="pcard" type="button" data-i="${i}" data-cat="${p.cat}">
        <div class="ph"><img src="${src(p.id + "/" + p.cover)}" alt="" loading="lazy" decoding="async"><span class="count">${n(p.files.length)} ${t("proj.images")}</span></div>
        <div class="meta"><h3>${p[lang]}</h3><span class="pid" dir="ltr">${p.id.toUpperCase()}</span></div>
        <span class="eyebrow">${catById(p.cat)[lang]}</span>
      </button>`).join("");
    $$("#pgrid .pcard").forEach(b => b.addEventListener("click", () => openViewer(+b.dataset.i)));
    setFilter(currentFilter, true);

    $("#film-list").innerHTML = S.films.map((fl, i) => `<button type="button" data-i="${i}" aria-pressed="${i === filmIdx}"><img src="${fl.poster}" alt="" loading="lazy"><span>${fl[lang]}</span></button>`).join("");
    $$("#film-list button").forEach(b => b.addEventListener("click", () => setFilm(+b.dataset.i, true)));
    $("#film-play").textContent = t(film.paused ? "films.play" : "films.pause");

    const yi = lang === "fa" ? 1 : 0;
    $("#work-rows").innerHTML = S.work.map(w => `<li><span class="yr">${w[yi]}</span><span><span class="who">${w[2 + yi]}</span>${w[4 + yi] ? `<span class="what">${w[4 + yi]}</span>` : ""}</span></li>`).join("");
    $("#stage-rows").innerHTML = S.stage.map(s => `<li><span class="who">${s[yi]}</span><span class="role">${s[2 + yi]}</span></li>`).join("");
    $("#edu-rows").innerHTML = S.edu.map(e => `<li><span class="yr">${e[yi]}</span><span><span class="who">${e[2 + yi]}</span><span class="what">${e[4 + yi]}</span></span></li>`).join("");
  }

  function setFilter(id, silent) {
    currentFilter = id;
    $$("#filters button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.f === id)));
    $$("#pgrid .pcard").forEach(c => c.classList.toggle("hide", id !== "all" && c.dataset.cat !== id));
    if (!silent && window.ScrollTrigger) ScrollTrigger.refresh();
  }

  /* ---------- project viewer ---------- */
  const viewer = $("#viewer"), vImg = $("#v-img"), vThumbs = $("#v-thumbs");
  let vp = null, vi = 0, lastFocus = null;
  function openViewer(i) {
    vp = S.projects[i]; vi = Math.max(0, vp.files.indexOf(vp.cover));
    lastFocus = document.activeElement;
    $("#v-title").textContent = vp[lang];
    $("#v-cat").textContent = catById(vp.cat)[lang] + " · " + vp.id.toUpperCase();
    vThumbs.innerHTML = vp.files.map((f, k) => `<button type="button" data-k="${k}" aria-label="${k + 1}"><img src="${src(vp.id + "/" + f)}" alt="" loading="lazy"></button>`).join("");
    $$("button", vThumbs).forEach(b => b.addEventListener("click", () => { vi = +b.dataset.k; showV(); }));
    viewer.hidden = false; document.body.style.overflow = "hidden"; lenis && lenis.stop();
    showV(); $("#v-close").focus();
  }
  function showV() {
    const f = vp.files[vi];
    vImg.style.opacity = 0;
    vImg.onload = () => { vImg.style.opacity = 1; };
    vImg.src = src(vp.id + "/" + f); vImg.alt = vp[lang] + " " + (vi + 1);
    $("#v-count").textContent = n(vi + 1) + " / " + n(vp.files.length);
    $$("button", vThumbs).forEach((b, k) => { b.setAttribute("aria-current", String(k === vi)); if (k === vi) b.scrollIntoView({ block: "nearest", inline: "center" }); });
  }
  function closeViewer() { viewer.hidden = true; document.body.style.overflow = ""; lenis && lenis.start(); lastFocus && lastFocus.focus(); }
  const step = d => { vi = (vi + d + vp.files.length) % vp.files.length; showV(); };
  $("#v-close").addEventListener("click", closeViewer);
  $("#v-prev").addEventListener("click", () => step(-1));
  $("#v-next").addEventListener("click", () => step(1));
  addEventListener("keydown", e => {
    if (viewer.hidden) return;
    const rtl = lang === "fa";
    if (e.key === "Escape") closeViewer();
    if (e.key === "ArrowRight") step(rtl ? -1 : 1);
    if (e.key === "ArrowLeft") step(rtl ? 1 : -1);
  });
  let tx = null;
  viewer.addEventListener("touchstart", e => { tx = e.touches[0].clientX; }, { passive: true });
  viewer.addEventListener("touchend", e => {
    if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 50) step((dx < 0 ? 1 : -1) * (lang === "fa" ? -1 : 1));
  });

  /* ---------- films ---------- */
  const film = $("#film");
  let filmIdx = 0;
  function setFilm(i, play) {
    filmIdx = i; const f = S.films[i];
    film.poster = f.poster; film.src = f.src; film.load();
    $$("#film-list button").forEach((b, k) => b.setAttribute("aria-pressed", String(k === i)));
    if (play) film.play().catch(() => {});
  }
  $("#film-play").addEventListener("click", () => { film.paused ? film.play().catch(() => {}) : film.pause(); });
  film.addEventListener("play", () => { $("#film-play").textContent = t("films.pause"); });
  film.addEventListener("pause", () => { $("#film-play").textContent = t("films.play"); });
  if ("IntersectionObserver" in window && !reduce) {
    new IntersectionObserver(es => es.forEach(e => { e.isIntersecting ? film.play().catch(() => {}) : film.pause(); }), { threshold: .35 }).observe(film);
  }

  /* ---------- copy ---------- */
  $$(".copy").forEach(btn => btn.addEventListener("click", () => {
    const el = document.getElementById(btn.dataset.copy);
    const done = () => { btn.textContent = t("con.copied"); setTimeout(() => btn.textContent = t("con.copy"), 1600); };
    const sel = () => { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
    try { navigator.clipboard.writeText(el.textContent.trim()).then(done, sel); } catch (e) { sel(); }
  }));

  /* ---------- language switch ---------- */
  $$(".lang button").forEach(b => b.addEventListener("click", () => {
    if (b.dataset.lang === lang) return;
    lang = b.dataset.lang;
    try { localStorage.setItem("pr-lang", lang); } catch (e) {}
    render(); if (window.gsap && window.ScrollTrigger) buildMotion();
  }));

  /* ---------- motion ---------- */
  let lenis = null, mm = null;
  function goTo(sel) { lenis ? lenis.scrollTo(sel, { offset: -10 }) : $(sel).scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }
  $$('.top a[href^="#"]').forEach(a => a.addEventListener("click", e => { e.preventDefault(); goTo(a.getAttribute("href")); }));

  render();

  if (!window.gsap || !window.ScrollTrigger) return;   // page stays fully readable without the libraries
  gsap.registerPlugin(ScrollTrigger);
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: .085 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const bar = $(".progress i");
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: s => gsap.set(bar, { scaleY: s.progress }) });

  function buildMotion() {
    if (mm) mm.revert();
    mm = gsap.matchMedia();
    const rtl = lang === "fa", sgn = rtl ? -1 : 1;

    mm.add("(min-width: 861px) and (prefers-reduced-motion: no-preference)", () => {
      // Hero stays fixed while the About section slides up over it (curtain);
      // the frame closes and the line appears in the first part of that rise.
      ScrollTrigger.create({ trigger: "#hero", start: "top top", end: "+=100%", pin: true, pinSpacing: false });
      const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: "#hero", start: "top top", end: "+=48%", scrub: .5 } });
      tl.to(".name-a", { xPercent: -230 * sgn, autoAlpha: 0, ease: "power1.in", duration: .5 }, 0)
        .to(".name-b", { xPercent: 230 * sgn, autoAlpha: 0, ease: "power1.in", duration: .5 }, 0)
        .to(".hero-sub, .hero-meta", { autoAlpha: 0, duration: .3 }, 0)
        .to(".hero-window", { clipPath: "inset(10% 22% 26% 22%)", ease: "power2.inOut", duration: .6 }, 0)
        .to(".hero-bg", { opacity: 1, duration: .6 }, 0)
        .to(".hero-img", { scale: 1.05, duration: 1 }, 0)
        .to(".window-dim", { opacity: .5, duration: .3 }, .45)
        .to(".frame-lines", { opacity: 1, duration: .2 }, .5)
        .to(".hero-after", { opacity: 1, y: 0, ease: "power2.out", duration: .35 }, .55);

      const track = $("#hz");
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      const hz = gsap.to(track, {
        x: () => -dist() * sgn, ease: "none",
        scrollTrigger: { trigger: "#disciplines", start: "top top", end: () => "+=" + dist(), scrub: 1, pin: true, invalidateOnRefresh: true }
      });
      $$(".card", track).forEach(card => {
        gsap.fromTo($(".art", card), { xPercent: -7 * sgn }, {
          xPercent: 7 * sgn, ease: "none",
          scrollTrigger: { trigger: card, containerAnimation: hz, start: rtl ? "right left" : "left right", end: rtl ? "left right" : "right left", scrub: true }
        });
      });
    });

    mm.add("(max-width: 860px) and (prefers-reduced-motion: no-preference)", () => {
      const st = { trigger: "#hero", start: "top top", end: "bottom top", scrub: true };
      gsap.to(".hero-img", { yPercent: 8, scale: 1.06, ease: "none", scrollTrigger: st });
      gsap.to(".hero-name", { yPercent: -50, autoAlpha: .15, ease: "none", scrollTrigger: st });
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const wipe = { trigger: ".proc-grid", start: "top 70%", end: "bottom 55%", scrub: true };
      gsap.fromTo(".drawing .d-line", { clipPath: "inset(0 0 0 6%)" }, { clipPath: "inset(0 0 0 100%)", ease: "none", scrollTrigger: wipe });
      gsap.fromTo(".drawing .wipe", { left: "6%" }, { left: "100%", ease: "none", scrollTrigger: wipe });
      $$(".sec-head h2").forEach(h => gsap.from(h, { y: 34, opacity: .3, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: h, start: "top 88%" } }));
      $$(".pcard").forEach((c, i) => gsap.from(c, { y: 26, opacity: .35, duration: .8, delay: (i % 3) * .06, ease: "power2.out", scrollTrigger: { trigger: c, start: "top 94%" } }));
      $$(".rows li, .step").forEach(li => gsap.from(li, { y: 14, opacity: .4, duration: .7, ease: "power2.out", scrollTrigger: { trigger: li, start: "top 93%" } }));
    });
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }
  buildMotion();
  addEventListener("load", () => ScrollTrigger.refresh());
})();
