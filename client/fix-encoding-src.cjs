// fix-encoding-src.cjs
// Uso: node fix-encoding-src.cjs
// Requiere: npm i iconv-lite glob

const fs = require("fs");
const path = require("path");
const iconv = require("iconv-lite");
const { globSync } = require("glob");

const root = process.cwd();
const includeDirs = ["src", "public", "components", "pages", "styles", "assets"];
const patterns = ["**/*.ts","**/*.tsx","**/*.js","**/*.jsx","**/*.html","**/*.css","**/*.json"];
const backupRoot = path.join(root, "encoding-backup-src");

fs.mkdirSync(backupRoot, { recursive: true });

function countBad(s) {
  const badRe = /Ã|Â|â|ï»¿|Ãƒ|Ã¢â|â€“|â€”|â€œ|â€™|â€¢|â†’|â€/g;
  const m = s.match(badRe);
  return m ? m.length : 0;
}

let converted = 0;

for (const dir of includeDirs) {
  const fullDir = path.join(root, dir);
  if (!fs.existsSync(fullDir)) continue;

  for (const pat of patterns) {
    const matches = globSync(path.join(dir, pat), { nodir: true, dot: true });
    for (const rel of matches) {
      try {
        const abs = path.join(root, rel);
        const bytes = fs.readFileSync(abs);

        // Opción A: interpretar como win1252 → UTF-8
        const as1252 = iconv.decode(bytes, "win1252");
        const scoreA = countBad(as1252);
        const currentUtf8 = bytes.toString("utf8");
        const scoreCurrent = countBad(currentUtf8);

        if (scoreA < scoreCurrent) {
          // backup
          const destBak = path.join(backupRoot, rel + ".bak");
          fs.mkdirSync(path.dirname(destBak), { recursive: true });
          fs.copyFileSync(abs, destBak);

          // escribir versión reparada
          fs.writeFileSync(abs, Buffer.from(as1252, "utf8"));
          converted++;
          console.log(`Reparado: ${rel}  (bad ${scoreCurrent} → ${scoreA})`);
        } else if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
          // quitar BOM si está
          const destBak = path.join(backupRoot, rel + ".bak");
          fs.mkdirSync(path.dirname(destBak), { recursive: true });
          fs.copyFileSync(abs, destBak);
          fs.writeFileSync(abs, bytes.slice(3));
          converted++;
          console.log(`BOM eliminado: ${rel}`);
        }
      } catch (err) {
        console.warn("Error procesando", rel, err.message);
      }
    }
  }
}

console.log("✅ Reparación completada. Archivos modificados:", converted);
console.log("Backups en:", backupRoot);