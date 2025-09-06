// replacePrismaModels.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Busca en la carpeta actual (donde ejecutas el script) y subcarpetas
const folderPath = path.resolve(__dirname);

const replacements = {
  'prisma.category': 'prisma.categories',
  'prisma.task': 'prisma.tasks',
  'prisma.offer': 'prisma.offers',
  'prisma.review': 'prisma.reviews',
  'prisma.user': 'prisma.users',
};

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

      for (const [singular, plural] of Object.entries(replacements)) {
        const regex = new RegExp(singular, 'g');
        content = content.replace(regex, plural);
      }

      if (content !== originalContent) {
        await fs.writeFile(fullPath, content, 'utf8');
        console.log(`Actualizado: ${fullPath}`);
      }
    }
  }
}

walkDir(folderPath)
  .then(() => {
    console.log('Reemplazos completados.');
  })
  .catch((err) => {
    console.error('Error durante el reemplazo:', err);
  });