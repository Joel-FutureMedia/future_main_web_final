import fs from "node:fs";
const src = new URL("../src/insights/insight.html", import.meta.url);
const out = new URL("../public/assets/insights/", import.meta.url);
fs.mkdirSync(out, { recursive: true });
const s = fs.readFileSync(src, "utf8");

// images, in document order
const names = ["signage.jpg", "fm-circle.png", "futuremedia-logo.png", "radiowave.png", "omulunga.png", "fresh.png", "nova.png", "99fm.png", "oneafrica.png"];
const imgs = [...s.matchAll(/<img[^>]*?alt="([^"]*)"[^>]*?src="data:image\/(jpeg|png);base64,([A-Za-z0-9+/=]+)"/g)];
console.log("images found", imgs.length);
imgs.forEach((m, i) => {
  const buf = Buffer.from(m[3], "base64");
  fs.writeFileSync(new URL(names[i], out), buf);
  let dim = "";
  if (m[2] === "png") dim = buf.readUInt32BE(16) + "x" + buf.readUInt32BE(20);
  console.log(names[i], "|", m[1], "|", m[2], buf.length, dim);
});

// map svg
const a = s.indexOf('<svg class="map"');
const b = s.indexOf("</svg>", a) + 6;
let svg = s.slice(a, b).replace(' preserveAspectRatio="none"', "").replace(' id="map"', "");
fs.writeFileSync(new URL("coverage-map.svg", out), svg);
console.log("svg", svg.length, svg.slice(0, 200));

// top-level structure of the svg, to plan the animation
const body = svg.slice(svg.indexOf("</defs>") + 7);
let depth = 0, order = [];
for (const m of body.matchAll(/<(\/?)(g|path|circle)\b([^>]*?)(\/?)>/g)) {
  const [, close, tag, attrs, self] = m;
  if (close) { depth--; continue; }
  if (depth === 0) order.push(tag + (attrs.match(/class="([^"]+)"/)?.[1] ? "." + attrs.match(/class="([^"]+)"/)[1] : ""));
  if (!self) depth++;
}
// compress runs
const runs = [];
for (const o of order) { const last = runs[runs.length - 1]; if (last && last[0] === o) last[1]++; else runs.push([o, 1]); }
console.log("top-level:", runs.map(r => r[0] + "×" + r[1]).join(" "));
