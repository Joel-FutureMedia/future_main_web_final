(() => {
  if (!document.body.classList.contains("insights-page")) return;

  const targets = [...document.querySelectorAll(".insight-card, .insights-docs")];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const full = 2 * Math.PI * 42;

  document.querySelectorAll(".ring-seg").forEach(seg => {
    seg.style.strokeDasharray = `${full} ${full}`;
    seg.style.strokeDashoffset = String(full);
  });

  function activate(el) {
    el.classList.add("in");
    el.querySelectorAll(".play-fill").forEach(fill => {
      const parent = fill.closest("li");
      const width = parent ? getComputedStyle(parent).getPropertyValue("--w").trim() : "0%";
      requestAnimationFrame(() => { fill.style.width = width || "0%"; });
    });
    el.querySelectorAll(".ring-seg").forEach(seg => {
      const dash = seg.dataset.dash || "";
      const offset = seg.dataset.offset || "0";
      requestAnimationFrame(() => {
        seg.style.strokeDasharray = dash;
        seg.style.strokeDashoffset = offset;
      });
    });
  }

  if (reduce) {
    targets.forEach(activate);
    return;
  }

  // Animate charts as soon as the page is ready so content is never blank.
  requestAnimationFrame(() => targets.forEach(activate));
})();
