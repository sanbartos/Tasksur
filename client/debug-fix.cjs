// debug-fix.cjs
const fs = require("fs");
const path = require("path");
const { globSync } = require("glob");

const root = process.cwd();
console.log("Directorio actual:", root);

const includeDirs = ["src", "public"];
for (const dir of includeDirs) {
  const fullDir = path.join(root, dir);
  console.log("Buscando en:", fullDir, "existe:", fs.existsSync(fullDir));
  if (fs.existsSync(fullDir)) {
    const files = globSync(path.join(dir, "**/*.ts*"), { nodir: true, dot: true });
    console.log("Archivos encontrados en", dir, ":", files.length);
    if (files.length > 0) {
      console.log("Ejemplos:", files.slice(0, 3));
    }
  }
}