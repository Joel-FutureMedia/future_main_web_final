import fs from "fs";
import path from "path";

const html = fs.readFileSync("offers/future-media-sponsorship-page/index.html", "utf8");
const sections = html.split(/<section class="brand"/);
const brands = [];

for (const s of sections.slice(1)) {
  const id = (s.match(/id="([^"]+)"/) || [])[1];
  const color = (s.match(/--c:(#[A-Fa-f0-9]+)/) || [])[1];
  const accent = (s.match(/--a:(#[A-Fa-f0-9]+)/) || [])[1];
  const name = (s.match(/<h2[^>]*>([^<]+)<\/h2>/) || [])[1];
  const reach = (s.match(/<strong>([^<]+)<\/strong>/) || [])[1];
  const reachLabel = (s.match(/<strong>[^<]+<\/strong><span>([^<]+)<\/span>/) || [])[1];
  const audienceImg = (s.match(/src="(assets\/[^"]+-audience\.jpg)"/) || [])[1];
  const introBlock = (s.match(/<div>\s*<h2[\s\S]*?<\/div>\s*<\/div><\/div>/) || [])[0] || "";
  const paragraphs = [...introBlock.matchAll(/<p(?![^>]*class="(?:reach|src)")[^>]*>([\s\S]*?)<\/p>/g)]
    .map((m) => m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const source = (introBlock.match(/<p class="src">([\s\S]*?)<\/p>/) || [])[1]?.replace(/\s+/g, " ").trim();

  const offers = [];
  for (const card of s.split('<article class="card"').slice(1)) {
    const title = (card.match(/<h3>([^<]+)<\/h3>/) || [])[1];
    const when = (card.match(/class="when">([^<]+)<\/p>/) || [])[1];
    const withHost = (card.match(/class="with">([\s\S]*?)<\/p>/) || [])[1]?.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    const desc = (card.match(/class="desc">([\s\S]*?)<\/p>/) || [])[1]?.replace(/\s+/g, " ").trim();
    const img = (card.match(/src="(assets\/[^"]+)"/) || [])[1];
    const benefits = [...card.matchAll(/<li>([^<]+)<\/li>/g)].map((x) => x[1].trim());
    const prime = (card.match(/class="prime">([^<]+)<\/p>/) || [])[1];
    if (title) {
      offers.push({
        title,
        when: when || "",
        withHost: withHost || "",
        desc: desc || "",
        image: img ? `/assets/offers/${path.basename(img)}` : "",
        benefits,
        prime: prime || ""
      });
    }
  }

  brands.push({
    id,
    color,
    accent,
    name,
    reach: reach || "",
    reachLabel: reachLabel || "",
    about: paragraphs[0] || "",
    source: source || "",
    audienceImage: audienceImg ? `/assets/offers/${path.basename(audienceImg)}` : "",
    offers
  });
}

fs.mkdirSync("src/data", { recursive: true });
fs.writeFileSync("src/data/sponsorship-offers.json", JSON.stringify({ brands }, null, 2));
console.log(brands.map((b) => `${b.id}: ${b.offers.length} (${b.color})`).join("\n"));
console.log("total", brands.reduce((n, b) => n + b.offers.length, 0));
