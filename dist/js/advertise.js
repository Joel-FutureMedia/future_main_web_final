document.querySelectorAll(".sol-acc[data-acc]").forEach(acc => {
  acc.addEventListener("toggle", event => {
    const target = event.target;
    if (!(target instanceof HTMLDetailsElement) || !target.open) return;
    acc.querySelectorAll("details").forEach(item => {
      if (item !== target) item.open = false;
    });
  }, true);
});
