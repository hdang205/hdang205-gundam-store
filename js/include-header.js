// Load shared header partial and insert into the page
(function () {
  async function loadHeader() {
    const paths = ["partials/header.html", "/partials/header.html"];
    let res = null;
    for (const p of paths) {
      try {
        res = await fetch(p, { cache: "no-store" });
        if (res.ok) {
          const html = await res.text();
          insertHeader(html);
          return;
        }
      } catch (e) {
        // try next
      }
    }
    console.warn("Could not load shared header from:", paths);
  }

  function insertHeader(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const header = doc.querySelector("header");
    if (!header) return;

    const existing = document.querySelector("header#header") || document.getElementById("site-header");
    if (existing) {
      existing.replaceWith(header);
    } else {
      document.body.insertBefore(header, document.body.firstChild);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadHeader);
  } else {
    loadHeader();
  }
})();
