// fix-replacements2.cjs
// Uso: node fix-replacements2.cjs
// No requiere paquetes externos.

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const includeDirs = ["src", "public"];
const exts = new Set([".ts", ".tsx", ".js", ".jsx", ".html", ".css", ".json"]);
const backupRoot = path.join(root, "replace-backup-src");
fs.mkdirSync(backupRoot, { recursive: true });

const replacements = [
  { from: "Ã±", to: "ñ" }, { from: "Ã‘", to: "Ñ" },
  { from: "Ã¡", to: "á" }, { from: "Ã©", to: "é" }, { from: "Ã­", to: "í" },
  { from: "Ã³", to: "ó" }, { from: "Ãº", to: "ú" },
  { from: "ÃƒÂ¡", to: "á" }, { from: "ÃƒÂ©", to: "é" }, { from: "ÃƒÂ­", to: "í" },
  { from: "ÃƒÂ³", to: "ó" }, { from: "ÃƒÂº", to: "ú" }, { from: "ÃƒÂ±", to: "ñ" },
  { from: "ÃƒÆ’Ã‚Â¡", to: "á" }, { from: "ÃƒÆ’Ã‚Â©", to: "é" }, { from: "ÃƒÆ’Ã‚Â­", to: "í" },
  { from: "ÃƒÆ’Ã‚Â³", to: "ó" }, { from: "ÃƒÆ’Ã‚Âº", to: "ú" }, { from: "ÃƒÆ’Ã‚Â±", to: "ñ" },
  { from: "ContraseÃ±a", to: "Contraseña" }, { from: "sesiÃ³n", to: "sesión" },
  { from: "CategorÃ­as", to: "Categorías" }, { from: "categorÃ­a", to: "categoría" },
  { from: "ArtÃ­culo", to: "Artículo" }, { from: "ArtiÂ­culo", to: "Artículo" },
  { from: "ï»¿", to: "" }, { from: "Â¿", to: "¿" }, { from: "Â¡", to: "¡" },
  { from: "Ã¢â‚¬Â¢", to: "•" }, { from: "â€¢", to: "•" }, { from: "â†’", to: "→" },
  { from: "â€œ", to: "“" }, { from: "â€", to: "”" }, { from: "â€™", to: "’" },
  { from: "â€”", to: "—" }, { from: "â€“", to: "–" }, { from: "â‚¬", to: "€" },
  { from: "artÃƒÆ’Ã‚Â­culo", to: "artículo" }, { from: "aquÃƒÆ’Ã‚Â­", to: "aquí" },
  { from: "mÃƒÆ’Ã‚Â¡s", to: "más" }, { from: "mÃ¡s", to: "más" }
];

function walk(dir) {
  let out = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    const full = path.join(dir, it.name);
    if (it.isDirectory()) {
      if (it.name === "node_modules" || it.name.startsWith(".")) continue;
      out.push(...walk(full));
    } else if (it.isFile()) {
      if (exts.has(path.extname(it.name))) out.push(full);
    }
  }
  return out;
}

let files = [];
for (const d of includeDirs) {
  const full = path.join(root, d);
  if (fs.existsSync(full)) {
    files.push(...walk(full));
  }
}

console.log("Archivos encontrados:", files.length);

let totalChanged = 0;
for (const abs of files) {
  try {
    let text = fs.readFileSync(abs, "utf8");
    let orig = text;
    let changed = false;
    let fileReplacements = 0;
    for (const r of replacements) {
      if (text.indexOf(r.from) !== -1) {
        text = text.split(r.from).join(r.to);
        changed = true;
        fileReplacements++;
      }
    }
    if (changed) {
      const rel = path.relative(root, abs);
      const destBak = path.join(backupRoot, rel + ".bak");
      fs.mkdirSync(path.dirname(destBak), { recursive: true });
      fs.copyFileSync(abs, destBak);
      fs.writeFileSync(abs, text, "utf8");
      totalChanged++;
      console.log(`Modificado: ${rel} (repl:${fileReplacements})`);
    }
  } catch (e) {
    console.warn("Error en", abs, e && e.message);
  }
}

console.log("Hecho. Archivos modificados:", totalChanged);
console.log("Backups en:", backupRoot);