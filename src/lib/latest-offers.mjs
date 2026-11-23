import data from "../data/sponsorship-offers.json";

const logos = {
  radiowave: "/assets/offers/logos/radiowave.webp",
  omulunga: "/assets/offers/logos/omulunga.webp",
  "fresh-fm": "/assets/offers/logos/fresh-fm.webp",
  nova: "/assets/offers/logos/nova.webp",
  "99fm": "/assets/offers/logos/99fm.webp",
  oneafrica: "/assets/offers/logos/oneafrica.webp"
};

export function offerSlug(title) {
  return String(title)
    .replace(/&amp;/gi, " and ")
    .replace(/&/g, " and ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function blurb(offer) {
  const text = String(offer.desc || offer.when || "").replace(/\s+/g, " ").trim();
  const sentence = text.split(/(?<=\.)\s/)[0] || text;
  return sentence.length > 110 ? `${sentence.slice(0, 107).trim()}…` : sentence;
}

export function offerRow(brandId, title, icon) {
  const brand = data.brands.find(item => item.id === brandId);
  const offer = brand?.offers.find(item => offerSlug(item.title) === offerSlug(title));
  if (!offer) throw new Error(`Missing offer: ${brandId} / ${title}`);
  return [
    offer.title.replace(/&amp;/g, "&"),
    blurb(offer),
    `/offers.html#${brandId}/${offerSlug(offer.title)}`,
    icon || logos[brandId],
    "contain"
  ];
}

export function brandRows(brandId, limit = 5, icon) {
  const brand = data.brands.find(item => item.id === brandId);
  if (!brand) throw new Error(`Missing brand: ${brandId}`);
  return brand.offers.slice(0, limit).map(offer => offerRow(brandId, offer.title, icon));
}
