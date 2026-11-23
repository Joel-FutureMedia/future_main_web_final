import fs from "node:fs";
for (const f of ["../public/assets/Broadcast Brands/FM_Brands_Intro_Personality.webp", "../public/assets/Digital/FM_Brands_Digital_Intro_Personality.webp"]) {
  const b = fs.readFileSync(new URL(f, import.meta.url));
  console.log(f, b.length, b.readUInt32BE(16) + "x" + b.readUInt32BE(20));
}
