// fix-replacements.cjs
// Uso: node fix-replacements.cjs
// Asegúrate de tener node instalado. No requiere paquetes externos.

const fs = require("fs");
const path = require("path");
const { globSync } = require("glob");

const root = process.cwd(); // carpeta actual: client
const includeDirs = ["src", "public"]; // rutas relativas desde client
const patterns = ["**/*.ts","**/*.tsx","**/*.js","**/*.jsx","**/*.html","**/*.css","**/*.json"];
const backupRoot = path.join(root, "replace-backup-src");
fs.mkdirSync(backupRoot, { recursive: true });

const replacements = [
  // letras y ñ
  { from: "Ã±", to: "ñ" }, { from: "Ã‘", to: "Ñ" },
  { from: "Ã¡", to: "á" }, { from: "Ã©", to: "é" }, { from: "Ã­", to: "í" },
  { from: "Ã³", to: "ó" }, { from: "Ãº", to: "ú" },
  // variantes dobles/triple (observadas)
  { from: "ÃƒÂ¡", to: "á" }, { from: "ÃƒÂ©", to: "é" }, { from: "ÃƒÂ­", to: "í" },
  { from: "ÃƒÂ³", to: "ó" }, { from: "ÃƒÂº", to: "ú" }, { from: "ÃƒÂ±", to: "ñ" },
  { from: "ÃƒÆ’Ã‚Â¡", to: "á" }, { from: "ÃƒÆ’Ã‚Â©", to: "é" }, { from: "ÃƒÆ’Ã‚Â­", to: "í" },
  { from: "ÃƒÆ’Ã‚Â³", to: "ó" }, { from: "ÃƒÆ’Ã‚Âº", to: "ú" }, { from: "ÃƒÆ’Ã‚Â±", to: "ñ" },
  // palabras comunes y combinadas observadas
  { from: "ContraseÃ±a", to: "Contraseña" },
  { from: "sesiÃ³n", to: "sesión" },
  { from: "CategorÃ­as", to: "Categorías" },
  { from: "categorÃ­a", to: "categoría" },
  { from: "segÃºn", to: "según" },
  { from: "ubicaciÃ³n", to: "ubicación" },
  { from: "CÃ³mo", to: "Cómo" },
  { from: "ConfiguraciÃ³n", to: "Configuración" },
  { from: "BotÃ³n", to: "Botón" },
  { from: "reseÃ±as", to: "reseñas" },
  { from: "informaciÃ³n", to: "información" },
  { from: "menÃº", to: "menú" },
  { from: "AÃ±ade", to: "Añade" },
  { from: "biografÃ­a", to: "biografía" },
  { from: "CalificaciÃ³n", to: "Calificación" },
  { from: "PolÃ­tica", to: "Política" },
  { from: "ReparaciÃ³n", to: "Reparación" },
  { from: "NavegaciÃ³n", to: "Navegación" },
  { from: "acciÃ³n", to: "acción" },
  { from: "DiseÃ±o", to: "Diseño" },
  { from: "informaciÃ³n", to: "información" },
  { from: "descripciÃ³n", to: "descripción" },
  { from: "notificaciÃ³n", to: "notificación" },
  { from: "tÃ­tulo", to: "título" },
  { from: "TÃ©rminos", to: "Términos" },
  { from: "estadÃ­sticas", to: "estadísticas" },
  { from: "PlomerÃ­a", to: "Plomería" },
  { from: "MÃ³vil", to: "Móvil" },
  { from: "contraseÃ±as", to: "contraseñas" },
  { from: "pÃ¡gina", to: "página" },
  { from: "ProtecciÃ³n", to: "Protección" },
  { from: "AlbaÃ±ilerÃ­a", to: "Albañilería" },
  { from: "ConducciÃ³n", to: "Conducción" },
  { from: "DÃ³lar", to: "Dólar" },
  { from: "RedacciÃ³n", to: "Redacción" },
  { from: "PaginaciÃ³n", to: "Paginación" },
  { from: "vacÃ­o", to: "vacío" },
  { from: "recibiÃ³", to: "recibió" },
  { from: "mÃ­nimo", to: "mínimo" },
  { from: "ArtÃ­culo", to: "Artículo" },
  { from: "artÃ­culos", to: "artículos" },
  { from: "mÃ¡s", to: "más" },
  { from: "Â¿", to: "¿" }, { from: "Â¡", to: "¡" }, { from: "ï»¿", to: "" },
  // símbolos
  { from: "Ã¢â‚¬Â¢", to: "•" }, { from: "â€¢", to: "•" },
  { from: "â†’", to: "→" }, { from: "â€º", to: "›" }, { from: "â€¹", to: "‹" },
  { from: "â€œ", to: "“" }, { from: "â€", to: "”" }, { from: "â€™", to: "’" },
  { from: "â€”", to: "—" }, { from: "â€“", to: "–" }, { from: "â‚¬", to: "€" },
  // casos compuestos observados
  { from: "artÃƒÆ’Ã‚Â­culo", to: "artículo" },
  { from: "aquÃƒÆ’Ã‚Â­", to: "aquí" },
  { from: "mÃƒÆ’Ã‚Â¡s", to: "más" },
  { from: "ArtiÂ­culo", to: "Artículo" }, // soft-hyphen
  { from: "ArtiÂ­culo", to: "Artículo" }
];

// construir lista de archivos a procesar
let files = [];
for (const dir of includeDirs) {
  const fullDir = path.join(root, dir);
  if (!fs.existsSync(fullDir)) continue;
  for (const pat of patterns) {
    const matches = globSync(path.join(dir, pat), { nodir: true, dot: true });
    files.push(...matches);
  }
}
files = Array.from(new Set(files)).filter(f => fs.existsSync(f));

console.log("Archivos a escanear:", files.length);

let totalChanged = 0;
for (const rel of files) {
  try {
    const abs = path.join(root, rel);
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
      // backup
      const destBak = path.join(backupRoot, rel + ".bak");
      fs.mkdirSync(path.dirname(destBak), { recursive: true });
      fs.copyFileSync(abs, destBak);

      // write new contents as utf8
      fs.writeFileSync(abs, text, "utf8");
      totalChanged++;
      console.log(`Modificado: ${rel}  (repl: ${fileReplacements})`);
    }
  } catch (err) {
    console.warn("Error procesando", rel, err && err.message);
  }
}

console.log("Hecho. Archivos modificados:", totalChanged);
console.log("Backups en:", backupRoot);