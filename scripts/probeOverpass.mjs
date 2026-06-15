// Sondagem: quantos POIs reais existem em Belo Horizonte no OpenStreetMap?
const q = `
[out:json][timeout:120];
area["name"="Belo Horizonte"]["admin_level"="8"]->.bh;
(
  nwr["tourism"~"attraction|museum|viewpoint|gallery|zoo|theme_park|artwork|aquarium"](area.bh);
  nwr["leisure"~"park|garden|nature_reserve|stadium"](area.bh);
  nwr["amenity"~"restaurant|cafe|bar|pub|ice_cream|fast_food|theatre|cinema|marketplace"](area.bh);
  nwr["shop"~"mall|bakery"](area.bh);
  nwr["historic"](area.bh);
);
out tags center;
`;
const r = await fetch("https://overpass-api.de/api/interpreter", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "SaiBH/1.0 (estudo)" },
  body: "data=" + encodeURIComponent(q),
});
if (!r.ok) { console.log("HTTP", r.status, await r.text()); process.exit(1); }
const j = await r.json();
const els = j.elements || [];
const named = els.filter((e) => e.tags && e.tags.name);
const cat = {};
const bump = (k) => (cat[k] = (cat[k] || 0) + 1);
for (const e of named) {
  const t = e.tags;
  if (t.tourism) bump("tourism:" + t.tourism);
  else if (t.leisure) bump("leisure:" + t.leisure);
  else if (t.amenity) bump("amenity:" + t.amenity);
  else if (t.shop) bump("shop:" + t.shop);
  else if (t.historic) bump("historic:" + t.historic);
}
const withHours = named.filter((e) => e.tags.opening_hours).length;
const withWeb = named.filter((e) => e.tags.website || e.tags["contact:website"]).length;
const withPhone = named.filter((e) => e.tags.phone || e.tags["contact:phone"]).length;
console.log("TOTAL elementos:", els.length, "| COM NOME:", named.length);
console.log("com opening_hours:", withHours, "| com website:", withWeb, "| com telefone:", withPhone);
console.log("\nPor categoria (top):");
Object.entries(cat)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(`  ${String(v).padStart(5)}  ${k}`));
