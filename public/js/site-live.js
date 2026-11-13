(function () {
  if (!window.FM) return;
  const $ = (sel, root = document) => root.querySelector(sel);

  function escape(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[ch]));
  }

  function note(id, message, ok) {
    const node = typeof id === "string" ? $(id) : id;
    if (!node) return;
    node.hidden = false;
    node.setAttribute("role", "status");
    node.className = "note " + (ok ? "ok" : "bad") + (node.classList.contains("sub-note") ? " sub-note" : "");
    node.textContent = message;
    node.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function busy(form, label) {
    const button = form.querySelector("[type=submit]");
    if (!button) return () => {};
    const previous = button.textContent;
    button.disabled = true;
    button.textContent = label;
    return next => {
      button.disabled = false;
      button.textContent = next || previous;
    };
  }

  function pop(html, cardClass = "pop-card") {
    document.querySelector(".pop")?.remove();
    const wrap = document.createElement("div");
    wrap.className = "pop";
    wrap.innerHTML = `<div class="${cardClass}">${html}</div>`;
    wrap.addEventListener("click", e => { if (e.target === wrap || e.target.dataset.close != null) wrap.remove(); });
    document.body.appendChild(wrap);
    return wrap;
  }

  function closingLabel(date) {
    if (!date) return "Open until filled";
    const parsed = new Date(String(date).slice(0, 10) + "T00:00:00");
    if (Number.isNaN(parsed.getTime())) return "Closing Date: " + date;
    return "Closing Date: " + parsed.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }

  function formatJobCopy(text) {
    const raw = String(text || "").trim();
    if (!raw) return "<p>Role details will be shared soon.</p>";
    if (/<[a-z][\s\S]*>/i.test(raw)) return raw;
    const lines = raw.replace(/\r/g, "").split("\n");
    let html = "";
    let list = [];
    const flush = () => {
      if (!list.length) return;
      html += "<ul>" + list.map(item => `<li>${item}</li>`).join("") + "</ul>";
      list = [];
    };
    const heading = /^(what you.?ll be doing|what we.?re looking for|you.?ll bring|you.?ll do|bonus points if|what.?s in it for you|about the role)\b/i;
    for (const lineRaw of lines) {
      const line = lineRaw.trim();
      if (!line) { flush(); continue; }
      const bullet = line.replace(/^[-•–]\s+/, "");
      if (bullet !== line) { list.push(escape(bullet)); continue; }
      flush();
      if (heading.test(line) || (line.endsWith(":") && line.length < 48)) {
        html += `<h3>${escape(line.replace(/:$/, ""))}</h3>`;
      } else {
        html += `<p>${escape(line)}</p>`;
      }
    }
    flush();
    return html || `<p>${escape(raw)}</p>`;
  }

  async function fillSelect(select, path, label = "name") {
    if (!select) return;
    const res = await FM.request(path);
    select.innerHTML = `<option value="">Select</option>` + (res.data || []).map(item =>
      `<option value="${item.id}">${escape(item[label])}</option>`
    ).join("");
  }

  function vacancyImage(job) {
    if (!job || job.mediaType !== "IMAGE" || !job.mediaPath) return "";
    return `<img src="${escape(FM.fileUrl(job.mediaPath))}" alt="${escape(job.title || "")}" onerror="this.remove()">`;
  }

  const demoVacancies = [
    {
      id: "demo-radio-producer",
      title: "Radio Producer",
      closingDate: null,
      location: "Windhoek",
      department: "Broadcast",
      description: [
        "About the role",
        "Join our broadcast team and help craft shows that keep Namibia listening — from daily drive-time to special series across the Future Media network.",
        "You’ll bring",
        "- Strong editorial judgement and on-air instincts",
        "- Experience producing live or recorded radio content",
        "- Clear communication with presenters, clients and sales",
        "You’ll do",
        "- Plan and produce daily and weekly shows",
        "- Coordinate guests, segments and promotions",
        "- Work with brand teams on campaign integrations",
        "What’s in it for you",
        "- A seat in Namibia’s leading media family",
        "- Creative briefs with real audience impact",
        "- Mentorship from experienced broadcast producers"
      ].join("\n"),
      mediaType: "IMAGE",
      mediaPath: null,
      demoImage: "/assets/Broadcast%20Brands/FM_Brands_Intro_Personality.png"
    },
    {
      id: "demo-digital-sales",
      title: "Digital Sales Executive",
      closingDate: null,
      location: "Windhoek",
      department: "Sales",
      description: [
        "About the role",
        "Grow Future Media’s digital brands with clients who want measurable reach across Specials.na, Shop Beat, Property News and more.",
        "You’ll bring",
        "- Media or digital sales experience",
        "- Confidence presenting packages and results",
        "- A hunger to build lasting client relationships",
        "You’ll do",
        "- Pitch digital packages and campaign ideas",
        "- Build proposals with brand and creative teams",
        "- Own the pipeline from first call to flight",
        "What’s in it for you",
        "- Competitive commission structure",
        "- Access to Namibia’s strongest digital inventory",
        "- Close collaboration with broadcast sales"
      ].join("\n"),
      mediaType: "IMAGE",
      mediaPath: null,
      demoImage: "/assets/Digital/FM_Brands_Digital_Intro_Personality.png"
    },
    {
      id: "demo-video-editor",
      title: "Video Editor",
      closingDate: null,
      location: "Windhoek",
      department: "Production",
      description: [
        "About the role",
        "Cut stories for One Africa, social and brand campaigns that hold attention — from commercials to show packages.",
        "You’ll bring",
        "- Proven editing skills in Premiere, Resolve or similar",
        "- An eye for pace, sound and on-brand graphics",
        "- Comfort working to broadcast and digital deadlines",
        "You’ll do",
        "- Edit commercials, social clips and show packages",
        "- Collaborate with producers and creatives",
        "- Deliver clean masters ready for air and web",
        "What’s in it for you",
        "- Varied briefs across TV, social and brand",
        "- Modern tools and a collaborative studio culture",
        "- Room to grow into senior edit / motion roles"
      ].join("\n"),
      mediaType: "IMAGE",
      mediaPath: null,
      demoImage: "/assets/vacancies/handshake.png"
    }
  ];

  function jobImageHtml(job, fallbackTitle) {
    const alt = escape(fallbackTitle || job.title || "Vacancy");
    const fallback = `/assets/vacancies/handshake.png`;
    if (job.mediaType === "IMAGE" && job.mediaPath) {
      return `<img src="${escape(FM.fileUrl(job.mediaPath))}" alt="${alt}" onerror="this.onerror=null;this.src='${fallback}'">`;
    }
    if (job.demoImage) {
      return `<img src="${escape(job.demoImage)}" alt="${alt}" onerror="this.onerror=null;this.src='${fallback}'">`;
    }
    return `<img src="${fallback}" alt="${alt}">`;
  }

  function renderVacancyCards(grid, items, isDemo) {
    grid.innerHTML = items.map(job => `
        <article class="job-card" data-id="${escape(String(job.id))}" ${isDemo ? 'data-demo="1"' : ""}>
          ${jobImageHtml(job)}
          <div class="job-copy">
            <h3>${escape(job.title)}</h3>
            <small>${isDemo ? "Open role · apply anytime" : closingLabel(job.closingDate)}</small>
          </div>
        </article>`).join("");
  }

  function openVacancyDetail(job, isDemo) {
    const meta = [
      job.department ? `<span>${escape(job.department)}</span>` : "",
      job.location ? `<span>${escape(job.location)}</span>` : "",
      `<span>${isDemo ? "Open role · apply anytime" : escape(closingLabel(job.closingDate))}</span>`
    ].filter(Boolean).join("");
    const modal = pop(`
      ${jobImageHtml(job)}
      <div class="job-detail-title">${escape(job.title)}</div>
      <div class="job-detail-meta">${meta}</div>
      <div class="job-detail-body">${formatJobCopy(job.description)}</div>
      <div class="job-detail-actions">
        <button class="btn" id="applyBtn" type="button">Apply now</button>
        <button class="btn ghost" data-close type="button">Close</button>
      </div>
    `, "pop-card job-detail");
    modal.querySelector("#applyBtn").onclick = () => {
      if (isDemo) {
        pop(`<h2>Apply for ${escape(job.title)}</h2>
          <p class="fm-lead">Send your CV and a short note on why you’re a fit. Our people team reviews every application.</p>
          <ul class="job-apply-points">
            <li>Email <a href="mailto:sales@futuremedia.com.na">sales@futuremedia.com.na</a></li>
            <li>Use subject line: <strong>Application: ${escape(job.title)}</strong></li>
            <li>Attach your CV (PDF preferred) and portfolio links if relevant</li>
          </ul>
          <div class="pop-actions">
            <button class="btn ghost" data-close type="button">Close</button>
            <a class="btn" href="mailto:sales@futuremedia.com.na?subject=${encodeURIComponent("Application: " + job.title)}">Email CV</a>
          </div>`, "pop-card job-apply");
        return;
      }
      applyForm(job);
    };
  }

  async function vacancies() {
    const grid = $("#jobGrid");
    if (!grid) return;
    const bind = (items, isDemo) => {
      renderVacancyCards(grid, items, isDemo);
      grid.onclick = async e => {
        const card = e.target.closest(".job-card");
        if (!card) return;
        if (card.dataset.demo === "1") {
          const job = demoVacancies.find(item => String(item.id) === card.dataset.id);
          if (job) openVacancyDetail(job, true);
          return;
        }
        try {
          const job = (await FM.request("/api/vacancies/public/" + card.dataset.id)).data;
          openVacancyDetail(job, false);
        } catch (error) {
          pop(`<h2>Role unavailable</h2><p>${escape(error.message || "Please try again shortly.")}</p><div class="pop-actions"><button class="btn ghost" data-close type="button">Close</button></div>`);
        }
      };
    };
    try {
      const res = await FM.request("/api/vacancies/public");
      const items = res.data || [];
      if (!items.length) { bind(demoVacancies, true); return; }
      bind(items, false);
    } catch (error) {
      bind(demoVacancies, true);
    }
  }

  function applyForm(job) {
    const modal = pop(`
      <h2>Apply for ${escape(job.title)}</h2>
      <p class="fm-lead">Share a few details and attach your CV. We’ll review every application.</p>
      <form id="applyForm" class="fm-form-body">
        <div class="fm-row">
          <label>Name<input name="name" required placeholder="First name"></label>
          <label>Surname<input name="surname" required placeholder="Surname"></label>
        </div>
        <div class="fm-row">
          <label>Date of birth<input name="dateOfBirth" type="date" required></label>
          <label>Highest qualification<input name="highestQualification" required placeholder="e.g. Diploma"></label>
        </div>
        <label>Work experience<textarea name="workExperience" rows="4" required placeholder="A short summary of your experience"></textarea></label>
        <label>Namibian?
          <select name="namibian" required>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </label>
        <label>CV (PDF or Word)<input name="cv" type="file" accept=".pdf,.doc,.docx" required></label>
        <p class="note" id="applyNote" hidden></p>
        <div class="pop-actions"><button class="fm-btn fm-btn-idle" data-close type="button">Cancel</button><button class="fm-btn" type="submit">Submit application</button></div>
      </form>
    `, "pop-card job-apply fm-form");
    modal.querySelector("#applyForm").onsubmit = async ev => {
      ev.preventDefault();
      const fd = new FormData(ev.target);
      fd.append("vacancyId", job.id);
      const release = busy(ev.target, "Sending application…");
      note("#applyNote", "Sending your application…", true);
      try {
        await FM.request("/api/applications/apply", { method: "POST", form: true, body: fd });
        note("#applyNote", "Application received. We’ll be in touch.", true);
        ev.target.querySelector("[type=submit]").disabled = true;
        ev.target.querySelector("[type=submit]").textContent = "Application sent";
      } catch (error) {
        note("#applyNote", error.message, false);
        release();
      }
    };
  }

  async function contact() {
    const form = $("#contactForm");
    if (!form) return;
    await Promise.all([
      fillSelect(form.brandId, "/api/brands/public"),
      fillSelect(form.salesId, "/api/sales/public"),
      fillSelect(form.serviceId, "/api/services/public")
    ]);
    const syncPhone = () => {
      const code = (form.phoneCode?.value || "").trim();
      const number = (form.phoneNumber?.value || "").replace(/[^\d\s()-]/g, "").trim();
      if (form.telephone) form.telephone.value = [code, number].filter(Boolean).join(" ").trim();
    };
    form.phoneCode?.addEventListener("change", syncPhone);
    form.phoneNumber?.addEventListener("input", syncPhone);
    syncPhone();
    form.onsubmit = async ev => {
      ev.preventDefault();
      syncPhone();
      if (!form.telephone?.value || form.telephone.value.replace(/\D/g, "").length < 8) {
        note("#contactNote", "Please enter a valid telephone number with your country code.", false);
        form.phoneNumber?.focus();
        return;
      }
      const release = busy(form, "Sending…");
      note("#contactNote", "Sending your message…", true);
      try {
        const body = Object.fromEntries(new FormData(form).entries());
        delete body.phoneCode;
        delete body.phoneNumber;
        await FM.request("/api/contact", { method: "POST", body });
        form.reset();
        if (form.phoneCode) form.phoneCode.value = "+264";
        syncPhone();
        note("#contactNote", "Message received. The sales team will follow up shortly.", true);
        release("Send message");
      } catch (error) {
        note("#contactNote", error.message || "We could not send that message. Please try again.", false);
        release();
      }
    };
  }

  const demoNews = [
    ["News", "Future of Business 2026 sells out its first day", "Nedbank Future of Business returns with record sponsor interest.", "/assets/news/news01.webp"],
    ["News", "99FM takes the Conversation Café on the road", "Live broadcasts, giveaways and street interviews across Windhoek.", "/assets/news/news02.webp"],
    ["News", "Fresh FM and Omulunga campaigns draw the crowds", "Brand activations connect advertisers to northern Namibia.", "/assets/news/news03.webp"]
  ];
  const demoEvents = [
    ["Conference", "Nedbank Future of Business 2027", "Namibia’s flagship business conference with keynotes, panels and networking.", "/assets/conference/slide1.webp"],
    ["Conference", "PropertyNews NamProp Conference", "Developers, agents, banks and conveyancers unpack Namibia’s property market.", "/assets/event/event2.webp"],
    ["Breakfast", "Flight Club 2027", "An invitation-only series where founders and decision makers trade ideas.", "/assets/event/event3.webp"]
  ];

  function storyCard(tag, title, text, img, extra) {
    return `<a class="card" ${extra} data-bg="url(${img})"><span class="tag">${tag}</span><h3>${title}</h3><p>${text}</p></a>`;
  }

  function paintCards(grid, html) {
    grid.innerHTML = html;
    grid.querySelectorAll(".card").forEach(el => {
      if (el.dataset.bg) el.style.backgroundImage = el.dataset.bg;
      el.classList.add("reveal-in");
    });
  }

  function paintDemo(grid, items, href) {
    paintCards(grid, items.map(([tag, title, text, img]) => storyCard(tag, title, text, img, `href="${href}"`)).join(""));
  }

  function bindStoryPop(grid, path) {
    grid.onclick = async e => {
      const card = e.target.closest(".card[data-id]");
      if (!card) return;
      e.preventDefault();
      const item = (await FM.request(path + card.dataset.id)).data;
      pop(`
        ${item.mediaType === "VIDEO" ? `<video src="${escape(FM.fileUrl(item.mediaPath))}" controls style="width:100%"></video>` : `<img src="${escape(FM.fileUrl(item.mediaPath))}" alt="">`}
        <h2>${escape(item.title)}</h2>
        <div class="pop-copy">${escape(item.description || "")}</div>
        <div class="pop-actions"><button class="btn ghost" data-close type="button">Close</button></div>
      `);
    };
  }

  function liveCards(items, tag) {
    return items.map(item => {
      const img = item.mediaPath ? FM.fileUrl(item.mediaPath) : "/assets/landingpage_image.webp";
      const text = (item.description || "").replace(/<[^>]+>/g, "").slice(0, 140);
      return storyCard(tag, escape(item.title), escape(text), img, `href="#" data-id="${item.id}"`);
    }).join("");
  }

  async function news() {
    const grid = $("#newsGrid");
    if (!grid) return;
    try {
      const res = await FM.request("/api/news/public");
      const items = res.data || [];
      if (!items.length) { paintDemo(grid, demoNews, "/news.html"); return; }
      paintCards(grid, liveCards(items, "News"));
      bindStoryPop(grid, "/api/news/public/");
    } catch (error) {
      paintDemo(grid, demoNews, "/news.html");
    }
  }

  async function events() {
    const grid = $("#eventGrid");
    if (!grid) return;
    try {
      const res = await FM.request("/api/events/public");
      const items = res.data || [];
      if (!items.length) { paintDemo(grid, demoEvents, "/conferences.html"); return; }
      paintCards(grid, liveCards(items, "Event"));
      bindStoryPop(grid, "/api/events/public/");
    } catch (error) {
      paintDemo(grid, demoEvents, "/conferences.html");
    }
  }

  const demoGallery = [
    ["/assets/NEDBANK_IMC_CONFERENCE_2025/DSC_5591_1.jpg", "Nedbank IMC Conference"],
    ["/assets/NEDBANK_IMC_CONFERENCE_2025/DSC_5618_1.jpg", "Conference floor"],
    ["/assets/2025_FUTUREMEDIA_CLIENT_FUNCTION/CLB8447.jpg", "Client function"],
    ["/assets/2025_FUTUREMEDIA_CLIENT_FUNCTION/CLB8469.jpg", "Future Media moments"],
    ["/assets/conference/slide1.webp", "Future of Business"],
    ["/assets/homepage/homepage.jpg", "Life at Future Media"]
  ];

  async function gallery() {
    if (document.body.classList.contains("gallery-page")) return;
    const grid = $("#galleryGrid");
    if (!grid) return;
    const paintLocal = () => {
      grid.innerHTML = demoGallery.map(([src, title]) => `<img src="${escape(src)}" alt="${escape(title)}" data-demo="1" data-title="${escape(title)}">`).join("");
      grid.onclick = e => {
        if (e.target.tagName !== "IMG") return;
        pop(`<img src="${escape(e.target.src)}" alt=""><h2>${escape(e.target.dataset.title || "Gallery")}</h2><div class="pop-actions"><button class="btn ghost" data-close type="button">Close</button></div>`);
      };
    };
    try {
      const res = await FM.request("/api/gallery/public");
      const items = res.data || [];
      if (!items.length) { paintLocal(); return; }
      grid.innerHTML = items.map(item => `<img src="${escape(FM.fileUrl(item.imagePath))}" alt="${escape(item.title || "")}" data-id="${item.id}">`).join("");
      grid.onclick = async e => {
        if (e.target.tagName !== "IMG") return;
        if (e.target.dataset.demo === "1") return;
        const item = (await FM.request("/api/gallery/public/" + e.target.dataset.id)).data;
        pop(`<img src="${escape(FM.fileUrl(item.imagePath))}" alt=""><h2>${escape(item.title || "Gallery")}</h2><div class="pop-actions"><button class="btn ghost" data-close type="button">Close</button></div>`);
      };
    } catch (error) {
      paintLocal();
    }
  }

  async function shopbeat() {
    const form = $("#shopbeatForm");
    if (!form) return;
    await fillSelect(form.feelingId, "/api/shopbeat/feelings/public");
    form.onsubmit = async ev => {
      ev.preventDefault();
      const release = busy(form, "Sending…");
      note("#shopbeatNote", "Sending your demo request…", true);
      try {
        const body = Object.fromEntries(new FormData(form).entries());
        await FM.request("/api/shopbeat/demo", { method: "POST", body });
        form.reset();
        note("#shopbeatNote", "Demo request received. We’ll be in touch about Shopbeat.", true);
        release("Request demo");
      } catch (error) {
        note("#shopbeatNote", error.message || "We could not send that request. Please try again.", false);
        release();
      }
    };
  }

  const demoFreelance = [
    { id: "demo-voice", title: "Voice Artist", closingDate: null, description: "<p>Record radio and brand audio with our in-house production team.</p>" },
    { id: "demo-camera", title: "Camera Operator", closingDate: null, description: "<p>Shoot commercials, social and conference content across Namibia.</p>" },
    { id: "demo-designer", title: "Graphic Designer", closingDate: null, description: "<p>Create on-brand stills, motion and social assets for Future Media campaigns.</p>" }
  ];

  async function freelancers() {
    const grid = $("#freelanceGrid");
    if (!grid) return;
    const bind = (items, isDemo) => {
      grid.innerHTML = items.map(role => `
        <article class="job-card" data-id="${escape(String(role.id))}" ${isDemo ? 'data-demo="1"' : ""}>
          <div class="job-copy">
            <h3>${escape(role.title)}</h3>
            <small>${isDemo ? "Join our freelance list" : closingLabel(role.closingDate)}</small>
          </div>
        </article>`).join("");
      grid.onclick = async e => {
        const card = e.target.closest(".job-card");
        if (!card) return;
        if (card.dataset.demo === "1") {
          const role = demoFreelance.find(item => String(item.id) === card.dataset.id);
          if (!role) return;
          pop(`
            <div class="job-detail-title">${escape(role.title)}</div>
            <div class="job-detail-body">${formatJobCopy(role.description)}</div>
            <p class="fm-lead">Demo role while live freelance posts sync. Email your portfolio to <a href="mailto:sales@futuremedia.com.na">sales@futuremedia.com.na</a>.</p>
            <div class="pop-actions"><button class="btn ghost" data-close type="button">Close</button><a class="btn" href="mailto:sales@futuremedia.com.na?subject=${encodeURIComponent("Freelance: " + role.title)}">Email portfolio</a></div>
          `, "pop-card job-detail");
          return;
        }
        try {
          const role = (await FM.request("/api/freelancers/public/" + card.dataset.id)).data;
          const modal = pop(`
            <div class="job-detail-title">${escape(role.title)}</div>
            <div class="job-detail-body">${formatJobCopy(role.description)}</div>
            <button class="btn" id="applyBtn" type="button">Apply</button>
          `, "pop-card job-detail");
          modal.querySelector("#applyBtn").onclick = () => freelancerForm(role);
        } catch (error) {
          pop(`<h2>Role unavailable</h2><p>${escape(error.message || "Please try again shortly.")}</p><div class="pop-actions"><button class="btn ghost" data-close type="button">Close</button></div>`);
        }
      };
    };
    try {
      const res = await FM.request("/api/freelancers/public");
      const items = res.data || [];
      if (!items.length) { bind(demoFreelance, true); return; }
      bind(items, false);
    } catch (error) {
      bind(demoFreelance, true);
    }
  }

  function freelancerForm(role) {
    const modal = pop(`
      <h2>Join as ${escape(role.title)}</h2>
      <p class="fm-lead">Tell us about your craft and how we can reach you.</p>
      <form id="freelanceForm" class="fm-form-body">
        <div class="fm-row">
          <label>Name<input name="name" required placeholder="First name"></label>
          <label>Surname<input name="surname" required placeholder="Surname"></label>
        </div>
        <div class="fm-row">
          <label>Email<input name="email" type="email" required placeholder="you@email.com"></label>
          <label>Telephone<input name="telephone" required placeholder="+264 …"></label>
        </div>
        <div class="fm-row">
          <label>Where you are based<input name="location" placeholder="City or town"></label>
          <label>Skill or craft<input name="skill" required placeholder="e.g. Producer"></label>
        </div>
        <label>Experience<textarea name="experience" rows="4" required placeholder="A short summary of your experience"></textarea></label>
        <label>Namibian?
          <select name="namibian" required>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </label>
        <label>CV (PDF or Word)<input name="cv" type="file" accept=".pdf,.doc,.docx" required></label>
        <p class="note" id="freelanceNote" hidden></p>
        <div class="pop-actions"><button class="fm-btn fm-btn-idle" data-close type="button">Cancel</button><button class="fm-btn" type="submit">Submit application</button></div>
      </form>
    `, "pop-card job-apply fm-form");
    modal.querySelector("#freelanceForm").onsubmit = async ev => {
      ev.preventDefault();
      const fd = new FormData(ev.target);
      fd.append("roleId", role.id);
      try {
        await FM.request("/api/freelancer-applications/apply", { method: "POST", form: true, body: fd });
        note("#freelanceNote", "Application sent. We’ll be in touch.", true);
        ev.target.querySelector("[type=submit]").disabled = true;
      } catch (error) {
        note("#freelanceNote", error.message, false);
      }
    };
  }

  async function companyProfile(event) {
    event.preventDefault();
    try {
      const res = await FM.request("/api/gated-documents/public");
      const items = res.data || [];
      if (!items.length) {
        pop(`<h2>Company Profile</h2><p>The company profile is not available for download yet.</p><div class="pop-actions"><button class="btn ghost" data-close type="button">Close</button></div>`);
        return;
      }
      const list = items.map(doc => `<button class="btn ghost" type="button" data-doc="${doc.id}">${escape(doc.title)}</button>`).join("");
      const modal = pop(`
        <h2>Company Profile</h2>
        <p>Tell us where to send it and we’ll email the document to you.</p>
        <div class="pop-actions" id="docChoices">${list}</div>
      `);
      modal.querySelector("#docChoices").onclick = async ev => {
        const choice = ev.target.closest("[data-doc]");
        if (!choice) return;
        const doc = (await FM.request("/api/gated-documents/public/" + choice.dataset.doc)).data;
        const form = pop(`
          <h2>${escape(doc.title)}</h2>
          <p>${escape(doc.description || "We’ll email this document to you.")}</p>
          <form id="docForm">
            <label>Name<input name="name" required></label>
            <label>Email<input name="email" type="email" required></label>
            <label>Telephone<input name="telephone" required></label>
            <label>Company<input name="company" required></label>
            <p class="note" id="docNote" hidden></p>
            <div class="pop-actions"><button class="btn ghost" data-close type="button">Cancel</button><button class="btn" type="submit">Send me the document</button></div>
          </form>
        `);
        form.querySelector("#docForm").onsubmit = async ev2 => {
          ev2.preventDefault();
          const release = busy(ev2.target, "Sending…");
          const email = ev2.target.email.value;
          note("#docNote", "Sending " + doc.title + "…", true);
          try {
            await FM.request("/api/gated-documents/" + doc.id + "/request", { method: "POST", body: Object.fromEntries(new FormData(ev2.target).entries()) });
            ev2.target.innerHTML = `<p class="note ok" role="status">Request received. We’ll email ${escape(doc.title)} to ${escape(email)}.</p>`;
          } catch (error) {
            note("#docNote", error.message || "We could not send that document. Please try again.", false);
            release();
          }
        };
      };
    } catch (error) {
      pop(`<h2>Company Profile</h2><p>${escape(error.message)}</p><div class="pop-actions"><button class="btn ghost" data-close type="button">Close</button></div>`);
    }
  }

  const demoDocuments = [
    { id: "demo-company-profile", title: "Company Profile", description: "A concise overview of Future Media’s brands, reach and partnerships across Namibia." },
    { id: "demo-audience-brief", title: "Audience Briefing", description: "Network audience, engagement and media-play highlights for planning and pitches." },
    { id: "demo-rate-overview", title: "Media Rate Overview", description: "A high-level look at broadcast and digital packaging — request the full deck by email." }
  ];

  function paintDocuments(grid, items, isDemo) {
    grid.innerHTML = items.map(doc => `
      <article class="doc-card" data-id="${escape(String(doc.id))}" ${isDemo ? 'data-demo="1"' : ""}>
        <div class="body"><h3>${escape(doc.title)}</h3><p>${escape(doc.description || "Request this briefing and we’ll email it to you.")}</p></div>
      </article>`).join("");
    grid.onclick = async e => {
      const card = e.target.closest(".doc-card");
      if (!card) return;
      if (card.dataset.demo === "1") {
        const doc = demoDocuments.find(item => String(item.id) === card.dataset.id) || { title: "Document", description: "" };
        pop(`
          <h2>${escape(doc.title)}</h2>
          <p>${escape(doc.description || "")}</p>
          <p class="fm-lead">Live document requests sync when the API is available. For now, email us and we’ll send the latest pack.</p>
          <div class="pop-actions"><button class="btn ghost" data-close type="button">Close</button><a class="btn" href="mailto:sales@futuremedia.com.na?subject=${encodeURIComponent("Request: " + doc.title)}">Email request</a></div>
        `);
        return;
      }
      try {
        const doc = (await FM.request("/api/gated-documents/public/" + card.dataset.id)).data;
        const modal = pop(`
          <h2>${escape(doc.title)}</h2>
          <p>${escape(doc.description || "")}</p>
          <form id="docForm">
            <label>Name<input name="name" required></label>
            <label>Email<input name="email" type="email" required></label>
            <label>Telephone<input name="telephone" required></label>
            <label>Company<input name="company" required></label>
            <p class="note" id="docNote" hidden></p>
            <div class="pop-actions"><button class="btn ghost" data-close type="button">Cancel</button><button class="btn" type="submit">Send me the document</button></div>
          </form>
        `);
        modal.querySelector("#docForm").onsubmit = async ev => {
          ev.preventDefault();
          const release = busy(ev.target, "Sending…");
          const email = ev.target.email.value;
          note("#docNote", "Sending " + doc.title + "…", true);
          try {
            await FM.request("/api/gated-documents/" + doc.id + "/request", { method: "POST", body: Object.fromEntries(new FormData(ev.target).entries()) });
            ev.target.innerHTML = `<p class="note ok" role="status">Request received. We’ll email ${escape(doc.title)} to ${escape(email)}.</p>`;
          } catch (error) {
            note("#docNote", error.message || "We could not send that document. Please try again.", false);
            release();
          }
        };
      } catch (error) {
        pop(`<h2>Document unavailable</h2><p>${escape(error.message || "Please try again shortly.")}</p><div class="pop-actions"><button class="btn ghost" data-close type="button">Close</button></div>`);
      }
    };
  }

  async function documents() {
    const grid = $("#docGrid");
    if (!grid) return;
    try {
      const res = await FM.request("/api/gated-documents/public");
      const items = res.data || [];
      if (!items.length) { paintDocuments(grid, demoDocuments, true); return; }
      paintDocuments(grid, items, false);
    } catch (error) {
      paintDocuments(grid, demoDocuments, true);
    }
  }

  async function homeBanner() {
    if (!document.body.classList.contains("home")) return;
    let banner = null;
    try { banner = (await FM.request("/api/banners/public/latest")).data; } catch {}
    if (!banner) {
      try {
        const list = (await FM.request("/api/banners/public")).data || [];
        banner = list.find(item => item.active !== false) || list[0];
      } catch {}
    }
    if (!banner) return;
    const bar = document.createElement("a");
    bar.className = "promo-banner";
    bar.href = "/news.html";
    bar.innerHTML = `${banner.imagePath ? `<img src="${escape(FM.fileUrl(banner.imagePath))}" alt="">` : "<span></span>"}<div><b>${escape(banner.title)}</b><span>${escape(banner.description || "")}</span></div><em>See more</em>`;
    document.querySelector(".landing")?.after(bar);
  }

  async function homeNews() {
    const wrap = document.querySelector(".cards");
    if (!wrap || !document.body.classList.contains("home")) return;
    try {
      const res = await FM.request("/api/news/public");
      const items = (res.data || []).slice(0, 3);
      if (!items.length) return;
      wrap.innerHTML = items.map(item => `
        <a class="card reveal-in" href="/news.html" style="background-image:url('${escape(FM.fileUrl(item.mediaPath))}')">
          <span class="tag">News</span>
          <h3>${escape(item.title)}</h3>
          <p>${escape((item.description || "").slice(0, 140))}</p>
        </a>`).join("");
    } catch {}
  }

  async function subscribe(form) {
    let status = form.querySelector(".sub-note");
    if (!status) {
      status = document.createElement("p");
      status.className = "note sub-note";
      status.hidden = true;
      form.appendChild(status);
    }
    form.onsubmit = async ev => {
      ev.preventDefault();
      const body = Object.fromEntries(new FormData(form).entries());
      body.language = body.language || "ENGLISH";
      const release = busy(form, "Subscribing…");
      note(status, "Subscribing you to FutureMedia updates…", true);
      try {
        await FM.request("/api/subscriptions", { method: "POST", body });
        form.reset();
        note(status, "You’re subscribed. We’ll send FutureMedia updates to your inbox.", true);
        release("Subscribed");
        form.querySelector("[type=submit]").disabled = true;
      } catch (error) {
        note(status, error.message || "We could not subscribe you right now. Please try again.", false);
        release();
      }
    };
  }

  vacancies();
  freelancers();
  contact();
  news();
  events();
  gallery();
  shopbeat();
  documents();
  homeBanner();
  homeNews();
  document.querySelectorAll("[data-subscribe]").forEach(subscribe);
  document.querySelectorAll("[data-company-profile]").forEach(link => {
    link.addEventListener("click", companyProfile);
  });
})();
