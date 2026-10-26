const svgText = fetch("/assets/namibia.svg").then(r => r.text());
const C = 2 * Math.PI * 42;

svgText.then(svg => {
  document.querySelectorAll(".nam-map").forEach(el => {
    el.innerHTML = svg.replace(/<\?xml[\s\S]*?\?>/, "");
    const root = el.querySelector("svg");
    if (root && !root.getAttribute("viewBox")) {
      root.setAttribute("viewBox", `0 0 ${root.getAttribute("width")} ${root.getAttribute("height")}`);
    }
    const on = new Set((el.dataset.regions || "").split(",").map(s => s.trim()));
    el.querySelectorAll("path").forEach(path => {
      const name = path.getAttribute("title") || "";
      if (name && !path.querySelector("title")) {
        const t = document.createElementNS("http://www.w3.org/2000/svg", "title");
        t.textContent = name;
        path.appendChild(t);
      }
      if (on.has(path.id)) path.classList.add("on");
    });
  });
});

document.querySelectorAll(".gender").forEach(el => {
  const f = Number(el.dataset.f);
  const m = Number(el.dataset.m);
  el.innerHTML = `<svg viewBox="0 0 120 120" aria-hidden="true">
    <circle class="track" cx="60" cy="60" r="42"></circle>
    <circle class="arc" cx="60" cy="60" r="42" stroke-dasharray="${C}" stroke-dashoffset="${C}"></circle>
    <text class="gf" x="60" y="66" text-anchor="middle">${f}%</text>
  </svg>
  <div class="glegend"><span><i></i>${f}% Female</span><span><i class="m"></i>${m}% Male</span></div>`;
  el.dataset.off = String(C * (1 - f / 100));
});

function runCount(el) {
  if (el.dataset.ran) return;
  el.dataset.ran = "1";
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix || "";
  const start = performance.now();
  const step = now => {
    const p = Math.min(1, (now - start) / 1100);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const sections = [...document.querySelectorAll(".brand")];
const links = [...document.querySelectorAll(".rail a")];
const watch = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("in");
    links.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + entry.target.id));
    entry.target.querySelectorAll(".count").forEach(runCount);
    entry.target.querySelectorAll(".gender .arc").forEach(arc => {
      arc.style.strokeDashoffset = arc.closest(".gender").dataset.off;
    });
  });
}, { threshold: 0.42 });
sections.forEach(section => watch.observe(section));
