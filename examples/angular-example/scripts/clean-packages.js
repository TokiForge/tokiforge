const fs = require('fs');
const path = require('path');

const packagesDir = path.join(__dirname, '../node_modules/@tokiforge');

['angular', 'core'].forEach(pkgName => {
  const srcDir = path.join(packagesDir, pkgName, 'src');
  const distDir = path.join(packagesDir, pkgName, 'dist');
  if (fs.existsSync(srcDir) && fs.existsSync(distDir)) {
    fs.rmSync(srcDir, { recursive: true, force: true });
  }
});
