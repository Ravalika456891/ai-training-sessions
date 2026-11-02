const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else if (file.endsWith('.ts')) {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });

  return arrayOfFiles;
}

const entryPoints = getAllFiles(path.join(__dirname, 'src'));

esbuild.buildSync({
  entryPoints,
  outdir: path.join(__dirname, 'dist'),
  platform: 'node',
  format: 'cjs',
  target: 'node20',
  sourcemap: true,
});

console.log(`✓ Successfully compiled ${entryPoints.length} TypeScript files to dist/`);
