window.FM = (function () {
  const local = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  const LIVE = "https://futuremediaapi.simplyfound.com.na";
  const base = local ? "http://localhost:8980" : (window.FM_API_BASE || LIVE);

  async function request(path, options = {}) {
    const headers = Object.assign({}, options.headers || {});
    const token = options.token || localStorage.getItem("fm_admin_token");
    if (token) headers.Authorization = "Bearer " + token;
    if (!options.form && options.body && typeof options.body !== "string") {
      headers["Content-Type"] = "application/json";
    }
    const timeoutMs = typeof options.timeoutMs === "number"
      ? options.timeoutMs
      : (options.form ? 60000 : 15000);
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = controller
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;
    try {
      const response = await fetch(base + path, {
        method: options.method || "GET",
        headers,
        signal: controller ? controller.signal : undefined,
        body: options.form
          ? options.body
          : options.body && typeof options.body !== "string"
            ? JSON.stringify(options.body)
            : options.body
      });
      const text = await response.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
      if (!response.ok || data.success === false) {
        const error = new Error(data.message || "Request failed");
        error.status = response.status;
        error.payload = data;
        throw error;
      }
      return data;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  function fileUrl(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) {
      // Keep absolute MinIO / CDN links intact for previews and downloads.
      return path;
    }
    return base.replace(/\/$/, "") + "/" + String(path).replace(/^\/+/, "");
  }

  return { base, request, fileUrl };
})();
