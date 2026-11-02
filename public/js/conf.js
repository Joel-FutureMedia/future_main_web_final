(() => {
  const sl = document.querySelector(".slides");
  const dots = document.querySelector(".dots");
  const title = document.querySelector("#ctitle");
  const desc = document.querySelector("#cdesc");
  const hero = document.querySelector(".confhero");
  const panel = document.querySelector(".cpanel");
  if (!sl || !dots || !title || !desc || typeof CONFS === "undefined") return;
  const pics = [...sl.querySelectorAll("img")].map((img) => img.getAttribute("src"));
  let i = 0;
  let timer;
  let token = 0;

  if (panel) {
    const rows = panel.querySelector(".rows");
    let arrows = panel.querySelector(".arrows");
    const top = panel.querySelector(".top");
    if (rows) {
      if (!arrows && top) {
        arrows = document.createElement("div");
        arrows.className = "arrows";
        arrows.innerHTML = `<button type="button" data-dir="-1" aria-label="Previous options">↑</button><button type="button" data-dir="1" aria-label="Next options">↓</button>`;
        top.appendChild(arrows);
      }
      if (arrows) {
        arrows.onclick = (e) => {
          const btn = e.target.closest("button");
          if (!btn) return;
          const item = rows.querySelector("a");
          const step = item ? item.getBoundingClientRect().height + 10 : 96;
          rows.scrollBy({ top: Number(btn.dataset.dir) * step, behavior: "smooth" });
        };
      }
    }
  }

  CONFS.forEach((_, k) => {
    const button = document.createElement("button");
    button.setAttribute("aria-label", "Slide " + (k + 1));
    button.onclick = () => {
      go(k);
      reset();
    };
    dots.append(button);
  });
  function go(n) {
    i = (n + CONFS.length) % CONFS.length;
    sl.style.transform = `translateX(-${i * 100}%)`;
    [...sl.querySelectorAll("figure")].forEach((fig, k) => fig.classList.toggle("is-active", k === i));
    [...dots.children].forEach((dot, k) => dot.classList.toggle("on", k === i));
    if (hero && pics[i]) hero.style.backgroundImage = `url("${pics[i]}")`;
    const current = ++token;
    title.classList.add("fade");
    desc.classList.add("fade");
    setTimeout(() => {
      if (current !== token) return;
      title.textContent = CONFS[i][0];
      desc.textContent = CONFS[i][1];
      title.classList.remove("fade");
      desc.classList.remove("fade");
    }, 250);
  }
  const reset = () => {
    clearInterval(timer);
    timer = setInterval(() => go(i + 1), 5500);
  };
  go(0);
  reset();
})();
