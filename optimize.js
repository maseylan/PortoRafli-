import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else if (name.endsWith('.png')) {
      files.push(name);
    }
  }
  return files;
}

async function optimize() {
  const files = getFiles('./public');
  for (const file of files) {
    console.log('Optimizing', file);
    const webpPath = file.replace(/\.png$/, '.webp');
    await sharp(file).webp({ quality: 80 }).toFile(webpPath);
    fs.unlinkSync(file);
  }
  console.log('Done!');
}

optimize().catch(console.error);
