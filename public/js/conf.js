(() => {
  const sl = document.querySelector(".conf-slider .slides") || document.querySelector(".slides");
  const dots = document.querySelector(".conf-slider .dots") || document.querySelector(".dots");
  const title = document.querySelector("#ctitle");
  const desc = document.querySelector("#cdesc");
  if (!sl || !title || !desc || typeof CONFS === "undefined") return;

  const lines = [...title.querySelectorAll("[data-line]")];
  let i = 0;
  let timer;
  let token = 0;

  if (dots) {
    CONFS.forEach((_, k) => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", "Slide " + (k + 1));
      button.onclick = () => {
        go(k);
        reset();
      };
      dots.append(button);
    });
  }

  function paint(n) {
    const conf = CONFS[n] || [];
    if (lines.length) {
      lines.forEach((el, idx) => {
        const text = conf[idx] || "";
        el.textContent = text || "\u00a0";
        el.style.visibility = text ? "visible" : "hidden";
      });
    } else {
      title.textContent = [conf[0], conf[1], conf[2]].filter(Boolean).join(" ");
    }
    desc.textContent = conf[3] || "\u00a0";
  }

  function go(n) {
    i = (n + CONFS.length) % CONFS.length;
    sl.style.transform = `translate3d(-${i * 100}%,0,0)`;
    [...sl.querySelectorAll("figure")].forEach((fig, k) => fig.classList.toggle("is-active", k === i));
    if (dots) [...dots.children].forEach((dot, k) => dot.classList.toggle("on", k === i));
    const current = ++token;
    title.classList.add("fade");
    desc.classList.add("fade");
    setTimeout(() => {
      if (current !== token) return;
      paint(i);
      title.classList.remove("fade");
      desc.classList.remove("fade");
    }, 250);
  }

  const reset = () => {
    clearInterval(timer);
    timer = setInterval(() => go(i + 1), 5500);
  };

  paint(0);
  go(0);
  reset();
})();
