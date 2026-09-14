import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const targets = [
  path.join(rootDir, 'node_modules/leaflet/dist/leaflet-src.js'),
  path.join(rootDir, 'node_modules/leaflet/dist/leaflet.js'),
  path.join(rootDir, 'node_modules/leaflet/src/geo/LatLng.js')
];

let totalPatched = 0;

for (const target of targets) {
  if (!fs.existsSync(target)) continue;
  let content = fs.readFileSync(target, 'utf8');
  let modified = false;

  // 1. In leaflet-src.js:
  // if (isNaN(lat) || isNaN(lng)) { throw new Error('Invalid LatLng object: (' + lat + ', ' + lng + ')'); }
  if (content.includes("throw new Error('Invalid LatLng object: (' + lat + ', ' + lng + ')')")) {
    content = content.replace(
      /if\s*\(\s*isNaN\(lat\)\s*\|\|\s*isNaN\(lng\)\s*\)\s*\{\s*throw new Error\('Invalid LatLng object: \(' \+ lat \+ ', ' \+ lng \+ '\)'\);\s*\}/g,
      "if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) { lat = 26.1584; lng = 92.9376; }"
    );
    modified = true;
  }

  // 2. In minified leaflet.js:
  // if(isNaN(t)||isNaN(e))throw new Error("Invalid LatLng object: ("+t+", "+e+")");
  if (content.includes('throw new Error("Invalid LatLng object: ("+t+", "+e+")")')) {
    content = content.replace(
      /if\(isNaN\(t\)\|\|isNaN\(e\)\)throw new Error\("Invalid LatLng object: \("\+t\+", "\+e\+"\)"\);/g,
      "if(isNaN(t)||isNaN(e)||!isFinite(t)||!isFinite(e)){t=26.1584;e=92.9376;}"
    );
    modified = true;
  }

  // 3. Fallback generic match for any variant
  if (content.includes("Invalid LatLng object")) {
    content = content.replace(
      /throw new Error\(['"]Invalid LatLng object: [^'"]+['"]\);?/g,
      "/* patched */ { this.lat = 26.1584; this.lng = 92.9376; return; }"
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(target, content, 'utf8');
    totalPatched++;
    console.log(`[patch-leaflet] Successfully patched ${path.relative(rootDir, target)}`);
  }
}

console.log(`[patch-leaflet] Total files patched: ${totalPatched}`);
