// addJsExtensionToImports.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const folderPath = path.resolve(__dirname);

const importRegex = /import\s+([^'"]+)\s+from\s+['"](\.\/[^'"]+|\.{2}\/[^'"]+)['"]/g;

async function walkDir(dir) {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      await walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = await fs.readFile(fullPath, 'utf8');
      let originalContent = content;

      content = content.replace(importRegex, (match, imports, importPath) => {
        // Si ya termina en .js, .json, .css, etc. no tocar
        if (/\.(js|json|css|mjs|cjs)$/.test(importPath)) {
          return match;
        }
        // Añadir .js al final del path
        return `import ${imports} from '${importPath}.js'`;
      });

      if (content !== originalContent) {
        await fs.writeFile(fullPath, content, 'utf8');
        console.log(`Actualizado imports en: ${fullPath}`);
      }
    }
  }
}

walkDir(folderPath)
  .then(() => {
    console.log('Actualización de imports completada.');
  })
  .catch((err) => {
    console.error('Error durante actualización de imports:', err);
  });