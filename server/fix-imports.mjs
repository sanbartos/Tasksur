// fix-imports.mjs
import fs from 'fs';
import path from 'path';

// Usa la carpeta actual desde donde se ejecuta el script
const directory = process.cwd();

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Regex para encontrar importaciones relativas sin extensión .js
  const importRegex = /import\s+([^'"]+)\s+from\s+['"](\.\/[^'"]+)(?<!\.js)['"]/g;

  let fixedContent = content.replace(importRegex, (match, imports, importPath) => {
    return match.replace(importPath, importPath + '.js');
  });

  if (fixedContent !== content) {
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    console.log(`Corregido: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.ts')) {
      fixImportsInFile(fullPath);
    }
  }
}

walkDir(directory);
console.log('Corrección de imports finalizada.');