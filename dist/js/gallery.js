(() => {
  const tabs = document.querySelector(".gallery-tabs");
  const albums = [...document.querySelectorAll(".gallery-album")];
  const items = [...document.querySelectorAll(".gallery-item")];
  const lightbox = document.querySelector("#galleryLightbox");
  if (!tabs || !lightbox || !items.length) return;

  const imgEl = lightbox.querySelector("#glImage");
  const caption = lightbox.querySelector("#glCaption");
  let visible = items;
  let index = 0;

  function setAlbum(id) {
    [...tabs.querySelectorAll("button")].forEach((btn) => btn.classList.toggle("on", btn.dataset.album === id));
    albums.forEach((section) => {
      const show = id === "all" || section.dataset.album === id;
      section.hidden = !show;
      section.classList.toggle("is-active", show);
    });
    visible = items.filter((item) => id === "all" || item.closest(".gallery-album")?.dataset.album === id);
  }

  tabs.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-album]");
    if (!btn) return;
    setAlbum(btn.dataset.album);
  });

  function openAt(i) {
    if (!visible.length) return;
    index = (i + visible.length) % visible.length;
    const item = visible[index];
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    lightbox.classList.remove("in");
    requestAnimationFrame(() => lightbox.classList.add("in"));
    imgEl.classList.remove("swap");
    void imgEl.offsetWidth;
    imgEl.classList.add("swap");
    imgEl.src = item.dataset.src;
    imgEl.alt = item.querySelector("img")?.alt || "";
    caption.textContent = item.dataset.title || "";
  }

  function close() {
    lightbox.classList.remove("in");
    document.body.style.overflow = "";
    setTimeout(() => {
      lightbox.hidden = true;
      imgEl.removeAttribute("src");
    }, 220);
  }

  document.querySelector(".gallery-main")?.addEventListener("click", (e) => {
    const item = e.target.closest(".gallery-item");
    if (!item) return;
    const i = visible.indexOf(item);
    openAt(i < 0 ? 0 : i);
  });

  lightbox.querySelector(".gl-close")?.addEventListener("click", close);
  lightbox.querySelector(".gl-prev")?.addEventListener("click", () => openAt(index - 1));
  lightbox.querySelector(".gl-next")?.addEventListener("click", () => openAt(index + 1));
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") openAt(index - 1);
    if (e.key === "ArrowRight") openAt(index + 1);
  });

  const io = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" })
    : null;

  items.forEach((item) => {
    if (io) io.observe(item);
    else item.classList.add("in");
  });

  setAlbum("all");
})();
