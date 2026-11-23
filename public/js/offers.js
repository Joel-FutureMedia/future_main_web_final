(() => {
  if (!document.body.classList.contains("offers-page")) return;

  const hub = document.querySelector("#spHub");
  const stage = document.querySelector("#spStage");
  const back = document.querySelector("#spBack");
  const search = document.querySelector("#spSearch");
  const status = document.querySelector("#spStatus");
  const lightbox = document.querySelector("#spLightbox");
  const lightImg = lightbox?.querySelector("img");
  const brands = [...document.querySelectorAll(".sp-brand")];
  const chips = [...document.querySelectorAll(".sp-chip")];

  const state = {
    brandId: "",
    index: 0,
    mode: "steps", // steps | all
    query: ""
  };

  function currentBrand() {
    return brands.find(b => b.dataset.brand === state.brandId) || null;
  }

  function cards(brandEl) {
    return [...(brandEl?.querySelectorAll(".sp-card") || [])];
  }

  function setHub(on) {
    document.body.classList.toggle("offers-hub-mode", on);
    document.body.classList.toggle("offers-brand-mode", !on);
    if (hub) hub.hidden = !on;
    if (stage) stage.hidden = on;
  }

  function paintChips() {
    chips.forEach(chip => {
      const on = chip.dataset.jumpBrand === state.brandId;
      chip.classList.toggle("on", on);
    });
  }

  function paintSteps(brandEl) {
    const steps = brandEl.querySelector(".sp-steps");
    const list = cards(brandEl);
    const q = state.query;
    const matched = list.filter(card => !q || (card.dataset.s || "").includes(q));
    const prev = steps.querySelector("[data-prev]");
    const next = steps.querySelector("[data-next]");
    const fill = steps.querySelector("[data-step-fill]");
    const cur = steps.querySelector("[data-step-current]");
    const total = steps.querySelector("[data-step-total]");
    const showAll = steps.querySelector("[data-show-all]");

    steps.classList.toggle("is-all", state.mode === "all");
    if (showAll) showAll.textContent = state.mode === "all" ? "Step by step" : "View all";

    if (state.mode === "all") {
      list.forEach(card => {
        const show = !q || (card.dataset.s || "").includes(q);
        card.hidden = !show;
        card.classList.toggle("is-active", show);
      });
      if (status) {
        status.textContent = q
          ? `${matched.length} programme${matched.length === 1 ? "" : "s"} match “${search.value.trim()}”`
          : `${list.length} programmes`;
      }
      return;
    }

    if (!matched.length) {
      list.forEach(card => { card.hidden = true; card.classList.remove("is-active"); });
      if (status) status.textContent = "No programmes match that search.";
      if (prev) prev.disabled = true;
      if (next) next.disabled = true;
      if (cur) cur.textContent = "0";
      if (total) total.textContent = "0";
      if (fill) fill.style.width = "0%";
      return;
    }

    if (state.index >= matched.length) state.index = matched.length - 1;
    if (state.index < 0) state.index = 0;

    list.forEach(card => {
      card.hidden = true;
      card.classList.remove("is-active");
    });
    const active = matched[state.index];
    active.hidden = false;
    active.classList.add("is-active");

    if (prev) prev.disabled = state.index <= 0;
    if (next) next.disabled = state.index >= matched.length - 1;
    if (cur) cur.textContent = String(state.index + 1);
    if (total) total.textContent = String(matched.length);
    if (fill) fill.style.width = `${((state.index + 1) / matched.length) * 100}%`;
    if (active?.dataset.offerId && state.brandId) {
      history.replaceState(null, "", `#${state.brandId}/${active.dataset.offerId}`);
    }
    if (status) {
      status.textContent = q
        ? `Step ${state.index + 1} of ${matched.length} matching “${search.value.trim()}”`
        : `Step ${state.index + 1} of ${matched.length}`;
    }
  }

  function openBrand(id, opts = {}) {
    state.brandId = id;
    state.index = Number.isInteger(opts.index) ? opts.index : 0;
    state.mode = opts.mode || "steps";
    setHub(false);
    brands.forEach(brand => {
      brand.hidden = brand.dataset.brand !== id;
    });
    paintChips();
    const brandEl = currentBrand();
    if (brandEl) paintSteps(brandEl);
    if (opts.scrollToSteps) {
      brandEl?.querySelector(".sp-steps")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function closeBrand() {
    state.brandId = "";
    setHub(true);
    brands.forEach(brand => { brand.hidden = true; });
    history.replaceState(null, "", location.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.querySelectorAll("[data-open-brand]").forEach(btn => {
    btn.addEventListener("click", () => {
      const raw = btn.dataset.offerIndex;
      const index = raw === undefined ? 0 : Number(raw);
      openBrand(btn.dataset.openBrand, { index: Number.isFinite(index) ? index : 0 });
    });
  });

  chips.forEach(chip => {
    chip.addEventListener("click", () => openBrand(chip.dataset.jumpBrand));
  });

  back?.addEventListener("click", closeBrand);

  search?.addEventListener("input", () => {
    state.query = search.value.trim().toLowerCase();
    state.index = 0;
    const brandEl = currentBrand();
    if (brandEl) paintSteps(brandEl);
  });

  document.querySelectorAll("[data-start-steps]").forEach(btn => {
    btn.addEventListener("click", () => {
      openBrand(btn.dataset.startSteps, { mode: "steps", scrollToSteps: true });
    });
  });

  brands.forEach(brand => {
    const steps = brand.querySelector(".sp-steps");
    steps?.querySelector("[data-prev]")?.addEventListener("click", () => {
      state.index -= 1;
      paintSteps(brand);
      brand.querySelector(".sp-card.is-active")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    steps?.querySelector("[data-next]")?.addEventListener("click", () => {
      state.index += 1;
      paintSteps(brand);
      brand.querySelector(".sp-card.is-active")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    steps?.querySelector("[data-show-all]")?.addEventListener("click", () => {
      state.mode = state.mode === "all" ? "steps" : "all";
      state.index = 0;
      paintSteps(brand);
    });
  });

  document.querySelectorAll(".sp-fig-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!lightbox || !lightImg) return;
      lightImg.src = btn.dataset.full || "";
      lightbox.showModal();
    });
  });

  lightbox?.addEventListener("click", e => {
    if (e.target === lightbox || e.target.closest("[data-close]")) lightbox.close();
  });

  document.addEventListener("keydown", e => {
    if (stage?.hidden) return;
    const brandEl = currentBrand();
    if (!brandEl || state.mode !== "steps") return;
    if (e.key === "ArrowRight") {
      state.index += 1;
      paintSteps(brandEl);
    }
    if (e.key === "ArrowLeft") {
      state.index -= 1;
      paintSteps(brandEl);
    }
    if (e.key === "Escape") closeBrand();
  });

  const filters = [...document.querySelectorAll("[data-filter]")];
  const rows = [...document.querySelectorAll("[data-brand-row]")];
  const minis = [...document.querySelectorAll(".sp-mini")];
  const count = document.querySelector("#spCount");
  const empty = document.querySelector("#spEmpty");
  const hubState = { cat: "all", brand: "" };

  function applyHub() {
    filters.forEach(btn => btn.classList.toggle("on", btn.dataset.filter === hubState.cat));
    rows.forEach(row => {
      row.hidden = hubState.cat === "all" || row.dataset.brandRow !== hubState.cat;
    });
    document.querySelectorAll("[data-pick-brand]").forEach(btn => {
      btn.classList.toggle("on", btn.dataset.pickBrand === hubState.brand && btn.dataset.pickCat === hubState.cat);
    });
    let shown = 0;
    minis.forEach(card => {
      const catOk = hubState.cat === "all" || card.dataset.cat === hubState.cat;
      const brandOk = !hubState.brand || card.dataset.brand === hubState.brand;
      const show = catOk && brandOk;
      card.hidden = !show;
      if (show) shown += 1;
    });
    if (count) count.textContent = `${shown} offer${shown === 1 ? "" : "s"}`;
    if (empty) empty.hidden = shown !== 0;
  }

  filters.forEach(btn => {
    btn.addEventListener("click", () => {
      hubState.cat = btn.dataset.filter || "all";
      hubState.brand = "";
      applyHub();
    });
  });

  document.querySelectorAll("[data-pick-brand]").forEach(btn => {
    btn.addEventListener("click", () => {
      const same = hubState.brand === btn.dataset.pickBrand && hubState.cat === btn.dataset.pickCat;
      hubState.cat = btn.dataset.pickCat || hubState.cat;
      hubState.brand = same ? "" : btn.dataset.pickBrand || "";
      applyHub();
    });
  });

  // Deep link: /offers.html#99fm or /offers.html#99fm/the-pitch
  const hash = decodeURIComponent(location.hash.replace(/^#/, ""));
  const [brandId, offerId] = hash.split("/");
  const linked = brands.find(brand => brand.dataset.brand === brandId);
  if (linked) {
    let index = 0;
    if (offerId) {
      const found = cards(linked).findIndex(card => card.dataset.offerId === offerId);
      if (found >= 0) index = found;
    }
    openBrand(brandId, { index });
  } else {
    setHub(true);
    applyHub();
  }
})();
