import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirsToScan = ['games', 'tools'];
const inputs = {};

dirsToScan.forEach((dirName) => {
  const fullDirPath = path.resolve(__dirname, 'src', dirName);

  if (fs.existsSync(fullDirPath)) {
    const files = fs.readdirSync(fullDirPath);

    files.forEach((file) => {
      if (file.endsWith('.ts')) {
        const name = path.basename(file, '.ts');
        const entryKey = `${dirName}/${name}`;
        inputs[entryKey] = path.resolve(fullDirPath, file);
      }
    });
  }
});

export default defineConfig({
  build: {
    outDir: '../jekyll-site/assets/js',
    emptyOutDir: true,
    rollupOptions: {
      input: inputs,
      output: {
        entryFileNames: '[name].js', 
        assetFileNames: '[name].[ext]',
      }
    }
  }
});